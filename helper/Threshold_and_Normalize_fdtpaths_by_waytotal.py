
# coding: utf-8

# ###### Nipype Workflow for ProbTrackX2 fdt_path waypath thresholding and normalization
# ## Normalization

# In[ ]:


from nipype import config
import os,glob,sys,shutil
import nipype.interfaces.fsl as fsl
import nipype.pipeline.engine as pe
import nipype.interfaces.utility as util
import nipype.interfaces.io as nio
from nipype.interfaces.utility import Split
from nipype.interfaces.fsl import Info
from nipype.interfaces.ants import WarpImageMultiTransform
from nipype.interfaces.utility import Function
from IPython.display import Image

MNI_template = Info.standard_image('MNI152_T1_1mm_brain.nii.gz')


# # Setup for DataGrabber inputs needed for thresholding
subjRootDir = "/data/HCP_BedpostData/"
outputDir = '/data/NipypeScratch/'


# Obtain functional images
datasource = pe.Node(interface=nio.DataGrabber(infields=['subject_id','roiName'],
        outfields=['nodif_brain',
                   'affDtiToStruct','warpDtiToStruct','invWarpDtiToStruct',
                   'affStructToMni','warpStructToMni','invWarpStructToMni'
                   ,'DtiPbxResults']),
        name='datasource')

datasource.inputs.base_directory = subjRootDir
datasource.inputs.template ='*'
datasource.inputs.sort_filelist = True

#samples_base_name_fxn = lambda x : x.replace('_th1samples.nii.gz','')
datasource.inputs.field_template = dict(
    nodif_brain='%s/T1w/Diffusion/nodif_brain.nii.gz', 
    affDtiToStruct='addlInfo/%s/dtiToStruct0GenericAffine.mat',
    warpDtiToStruct='addlInfo/%s/dtiToStruct1Warp.nii.gz',
    invWarpDtiToStruct='addlInfo/%s/dtiToStruct1InverseWarp.nii.gz',
    affStructToMni='addlInfo/%s/structToMni0GenericAffine.mat',
    warpStructToMni='addlInfo/%s/structToMni1Warp.nii.gz',
    invWarpStructToMni='addlInfo/%s/structToMni1InverseWarp.nii.gz',    
    DtiPbxResults='addlInfo/%s/pbxResults/DTI/Human_%s_fdt_paths.nii.gz'
    )

## Can take the first subject and compute the number of expected ROIs
datasource.inputs.template_args = dict(
    nodif_brain=[['subject_id']], 
    affDtiToStruct=[['subject_id']],
    warpDtiToStruct=[['subject_id']],
    invWarpDtiToStruct=[['subject_id']],
    affStructToMni=[['subject_id']],
    warpStructToMni=[['subject_id']],
    invWarpStructToMni=[['subject_id']],
    DtiPbxResults=[['subject_id','roiName']]
    )


# ## Find and iterate through Subjects:
# List of subjects:
FULL_SUBJECT_LIST = [x for x in os.listdir(subjRootDir) 
                     if os.path.isdir( subjRootDir+'/addlInfo/'+x+'/pbxResults/DTI')]
print(len(FULL_SUBJECT_LIST),"Subjects are potentially available to be processed!")


# Subject infosource:
subj_infosource = pe.Node(interface=util.IdentityInterface(fields=['subject_id']), 
                          name="subj_infosource")
# Run All Subjects:
subj_infosource.iterables = ('subject_id', FULL_SUBJECT_LIST)


# ## Threshold and then Normalize images
# ROI_infosource:
roi_infosource = pe.Node(interface=util.IdentityInterface(fields=['subject_id', 'roiName']), 
                         name="roi_infosource")

roi_infosource.iterables = ('roiName',['Hypothalamus_Left','Hypothalamus_Right','Hypothalamus_Bilat',
                                       'BA17_bilat','BA_4ap_bilat',
                                       'BasalForebrain_Bilat','BasalForebrain_Left','BasalForebrain_Right',
                                       'Bilat_Accumbens_HarvardOxford-sub-maxprob-thr25-1mm'])


# Thresholds input using FSL Maths
# ifiles: original input file
Threshold = pe.Node(fsl.Threshold(),
                 name = 'Threshold')

# Normalizes input using FSL Maths -div
Normalize = pe.Node(fsl.BinaryMaths(operation='div'),
                 name = 'Normalize')

# Input the waytotal file and return waytotal
def getWaytotal(in_file):
    import subprocess
    import re
    
    print(in_file)
    
    in_file= re.sub('fdt_paths.nii.gz', 'waytotal', in_file)
    mycommand= "cat "+str(in_file)
    mycommand= mycommand.split(sep=' ')
    result= subprocess.run(mycommand, stdout=subprocess.PIPE)
    tmpwaytotal= result.stdout.decode("utf-8").split(' ')[0]
    print(in_file)
    print('waytotal: %s' % tmpwaytotal)
    
    if(not tmpwaytotal): 
        print('Waytotal Empty for: %s' % pathwaytotal)
    else:
        waytotal= float(tmpwaytotal)                
        return( waytotal )

# Returns waytotal and scaled waytotal:
def scaleWaytotal(waytotal,Tscaling):     
    waytotal= float(waytotal)                
    return( waytotal, float(waytotal) / Tscaling    )    
    
getWaytotal_node = pe.Node( name="getWaytotal_node",
                           interface=Function(input_names=["in_file"],
                                              output_names=["waytotal"],
                                              function=getWaytotal)
                          )

    
scaleWaytotal_node = pe.Node( name="scaleWaytotal_node",
                             interface=Function(input_names=["waytotal","Tscaling"],
                                                output_names=["waytotal","scaledWaytotal"],
                                                function=scaleWaytotal)
                            )

# Tscaling to use: 5000
scaleWaytotal_node.inputs.Tscaling = 5000
#scaleWaytotal_node.iterables = ("Tscaling", [50,500,5000])

# Warp DTI (subject space) to MNI
warp_pbxDti_to_Mni = pe.Node(WarpImageMultiTransform(use_nearest=True,
                                                     reference_image= MNI_template),
                             name="warp_pbxDti_to_Mni")

## Store the XFMS
merge_xfms = pe.Node(util.Merge(4), name='merge_xfms')


# Workflow: Threshold by scaled waytotal, normalize by waytotal, map to MNI
wf = pe.Workflow(name="PbxThreshNormWarp_AllSubjects_AllROIs_T5000")
wf.base_dir = outputDir

# Connect Subjects to ROI infosource, roiName iterates through ROIs
wf.connect(subj_infosource,'subject_id', roi_infosource,'subject_id')

# roi infosource to datasource (DataGrabber)
wf.connect(roi_infosource,'subject_id', datasource,'subject_id')
wf.connect(roi_infosource,'roiName', datasource,'roiName')

## Threshold DtiPbxResults by scaled waytotal:
# datasource to getWaytotal_node
wf.connect( datasource,'DtiPbxResults', getWaytotal_node,'in_file')
# getWaytotal_node to scaleWaytotal_node
wf.connect( getWaytotal_node,'waytotal', scaleWaytotal_node,'waytotal')
# scaleWaytotal_node to Threshold
wf.connect(scaleWaytotal_node,'scaledWaytotal', Threshold,'thresh')
# Threshold DtiPbxResults by scaledWaytotal
wf.connect(datasource,'DtiPbxResults', Threshold,'in_file')

## Normalize Thresholded DtiPbxResults by waytotal:
# waytotal to Normalize operand
wf.connect(scaleWaytotal_node,'waytotal', Normalize,'operand_value')
# Thresholded file to Normalize
wf.connect(Threshold,'out_file',Normalize,'in_file')

## Merge transformation files into merge_xfms
wf.connect(datasource,'warpStructToMni',merge_xfms,"in1")
wf.connect(datasource,'affStructToMni',merge_xfms,"in2")
wf.connect(datasource,'warpDtiToStruct',merge_xfms,"in3")
wf.connect(datasource,'affDtiToStruct',merge_xfms,"in4")


# Normalized file to warp_pbxDti_to_Mni input
wf.connect(Normalize,"out_file",warp_pbxDti_to_Mni,"input_image")
# merge_xfms to warp_pbxDti_to_Mni transformations
wf.connect( merge_xfms,  'out', warp_pbxDti_to_Mni, 'transformation_series')

# Run Workflow
wf.run(plugin='MultiProc', plugin_args={'n_procs': 40})


# # End Threshold and Normalize
