#%% Change working directory from the workspace root to the ipynb file location. Turn this addition off with the DataScience.changeDirOnImportExport setting
import os
try:
	os.chdir(os.path.join(os.getcwd(), 'helper'))
	print(os.getcwd())
except:
	pass
#%% [markdown]
# ###### Nipype Workflow for ProbTrackX2 fdt_path waypath thresholding and normalization
# ## DG Version 1: Normalization

#%%
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

#%% [markdown]
# # Setup for DataGrabber inputs needed for thresholding

#%%
datasource = pe.Node(interface=nio.DataGrabber(infields=['subject_id','roiName'],
        outfields=['nodif_brain',
                   'affDtiToStruct','warpDtiToStruct','invWarpDtiToStruct',
                   'affStructToMni','warpStructToMni','invWarpStructToMni'
                   ,'DtiPbxResults']),
        name='datasource')
# create a node to obtain the functional images
datasource.inputs.base_directory = "/data/HCP_BedpostData/"
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

#Human_Hypothalamus_Right_fdt_paths.nii.gz
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


#%%
subjRootDir = "/data/HCP_BedpostData/"
FULL_SUBJECT_LIST = [x for x in os.listdir(subjRootDir) if os.path.isdir( subjRootDir+'/addlInfo/'+x+'/pbxResults/DTI')]
print(len(FULL_SUBJECT_LIST),"Subjects are potentially available to be processed!")

"""
Setup for Normalized pbx2 results Computational Pipeline
"""
subj_infosource = pe.Node(interface=util.IdentityInterface(fields=['subject_id']),  name="subj_infosource")
#infosource.iterables = ('subject_id', SampleSubjList)
subj_infosource.iterables = ('subject_id', FULL_SUBJECT_LIST[100:500])
### Above just converts the list of subjects into an iterable list I can connect to the next part of the pipeline

#%% [markdown]
# ## Threshold and then Normalize images

#%%
## Create an roi_inforousrce
## DO NOT FORGET  THE HUMAN_ IS PART OF THE TEMPLATE SO DO NOT INCLUDE IT


roi_infosource = pe.Node(interface=util.IdentityInterface(fields=['subject_id','roiName']), name="roi_infosource")
roi_infosource.iterables = ('roiName',['Hypothalamus_Left','Hypothalamus_Right','Hypothalamus_Bilat',
                                        'BA17_bilat','BA_4ap_bilat',
                                      'BasalForebrain_Bilat','BasalForebrain_Left',
                                       'BasalForebrain_Right',
                                      'Bilat_Accumbens_HarvardOxford-sub-maxprob-thr25-1mm'])


#%%
# Node: Function: Thresholds using FSL Maths
# ifiles: original input file
Threshold = pe.Node(fsl.Threshold(),
                 name = 'Threshold')

# Node: Function: Normalizes using FSL Maths -div
Normalize = pe.Node(fsl.BinaryMaths(operation='div'),
                 name = 'Normalize')

def getWaytotal(in_file): 
    ### Process the waytotal file and grab the integer
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


def scaleWaytotal(waytotal,Tscaling): 
    ### Input the waytotal file and return waytotal, and a scaled waytotal to use for scaling
    
    waytotal= float(waytotal)                
    return( waytotal, float(waytotal) / Tscaling    )    
    
getWaytotal_node = pe.Node( name="getWaytotal_node",
                        interface=Function(input_names=["in_file"],
                        output_names=["waytotal"],
                        function=getWaytotal
                                          ) )

    
scaleWaytotal_node = pe.Node( name="scaleWaytotal_node",
                        interface=Function(input_names=["waytotal","Tscaling"],
                        output_names=["waytotal","scaledWaytotal"],
                        function=scaleWaytotal) )



#scaleWaytotal_node.inputs.Tscaling = 500
scaleWaytotal_node.iterables = ("Tscaling", [50,500,5000])

warp_pbxDti_to_Mni = pe.Node( WarpImageMultiTransform(use_nearest=True,reference_image=MNI_template), 
                             name="warp_pbxDti_to_Mni")

## Create a merge node to store the XFMS
merge_xfms = pe.Node(util.Merge(4), name='merge_xfms')

#procWaytotal_node.iterables = ("Tscaling",  [5000,1000,500,100,50])


#%%
###  I NEED THE WAYTOTAL AND THE SCALED WAYTOTAL.... OOPS!!!

# Workflow: Initialize
wf = pe.Workflow(name="threshAndWarpPBX")
wf.base_dir = '/data/NipypeScratch/'
wf.connect(subj_infosource,'subject_id',roi_infosource,'subject_id')

wf.connect(roi_infosource,'subject_id',datasource,'subject_id')
wf.connect(roi_infosource,'roiName',datasource,'roiName')

wf.connect( datasource,'DtiPbxResults',getWaytotal_node,'in_file')
    
wf.connect( getWaytotal_node,'waytotal',scaleWaytotal_node,'waytotal')

    
wf.connect(scaleWaytotal_node,'scaledWaytotal',Threshold,'thresh')
wf.connect(datasource,'DtiPbxResults',Threshold,'in_file')


wf.connect(scaleWaytotal_node,'waytotal',Normalize,'operand_value')
wf.connect(Threshold,'out_file',Normalize,'in_file')

wf.connect(datasource,'warpStructToMni',merge_xfms,"in1")
wf.connect(datasource,'affStructToMni',merge_xfms,"in2")
wf.connect(datasource,'warpDtiToStruct',merge_xfms,"in3")
wf.connect(datasource,'affDtiToStruct',merge_xfms,"in4")

# # ##antsApplyTransforms -d 3 -i A.nii.gz -o ADeformed.nii.gz -r C.nii.gz -t RegB2C1Warp.nii.gz  -t RegB2C0GenericAffine.mat -t RegA2B1Warp.nii.gz -t RegA2B0GenericAffine.mat

# # ## Connect the pbx2 results I want to warp
wf.connect(Normalize,"out_file",warp_pbxDti_to_Mni,"input_image")
wf.connect( merge_xfms,  'out', warp_pbxDti_to_Mni, 'transformation_series')

# ### need to make sure I feed the same modified waytotal to both functions
# # Run Workflow
#wf.run()
wf.run(plugin='MultiProc', plugin_args={'n_procs': 30})


#%%

# ### Connect the dti_datasource to the pbx2 command
# wf.connect( datasource,'DtiPbxResults',roiSplit,'inlist')  
           
# wf.connect( datasource,'DtiPbxResults',roi_infosource,'pbxResults')
           


# Workflow: Graph: Exec   'exec', 'hierarchical'
imgOutput = wf.write_graph(graph2use='exec',simple_form=True)
#,  dotfilename='/output/graph_exec.dot')
#wf.write_graph(graph2use='hierarchical', dotfilename='/output/graph_exec.dot')
#img
# Visualize graph
Image(imgOutput)


#%%
get_ipython().run_cell_magic('bash', '', '# Print directory structure\ntree -C -I "*.nii.gz" /data/SASRAID/ThreshNipype/output | grep -v -e ".*report" -e ".*pklz" -e ".*json"')

#%% [markdown]
# ## Generate subject file lists for each feature in group:

#%%
metaloc= '/code/notebooks/postPBX/unrestricted_dagutman_7_12_2018_15_39_53.csv'
group='Gender'
feature='M'
bedpostx_dir= '/data/NipypeScratch/runpbx2/*'

#%% [markdown]
# #### bedpostx_results= [subject_directories]

#%%
bedpostx_results= [ fn for fn in glob.glob(bedpostx_dir) if re.search( '[0-9][0-9]$', fn)  ]

#%% [markdown]
# ### subjectinfo= {subject_id: {'waytotals': [paths], 'fdt_paths': [paths]}}

#%%
get_ipython().system('ls /data/NipypeScratch/runpbx2/_subject_id_880157/_seed*/pbx2/waytotal')


#%%
A= '/data/NipypeScratch/runpbx2/_subject_id_880157/_seed_..data..HCP_Data..EHECHT_ROIS..Human_Hypothalamus_Right.nii.gz/pbx2/waytotal'


#%%
mycommand= "cat "+A
mycommand= mycommand.split(sep=' ')
result= subprocess.run(mycommand, stdout=subprocess.PIPE)
int( result.stdout )


#%%
get_ipython().system(" cat '/data/NipypeScratch/runpbx2/_subject_id_880157/_seed_..data..HCP_Data..EHECHT_ROIS..Human_Hypothalamus_Right.nii.gz/pbx2/waytotal'")


#%%
get_ipython().system(' ls /NipypeScratch')


#%%
infosource = Node(IdentityInterface(fields=['fdt_path']),
                  name="infosource")
infosource.iterables = [('fdt_path', fdt_paths)]


#%%

## STEPS 



### GET WAYTOTAL FOR the TRACTOGRAPHY RUN
## calculate the threshold which is   0.1% or 0.01%  i.e. 0.001 and 0.0001 * waytotal
### fslmaths fdt_paths.nii.gz -thr <somenumber> -div waytotal (or waytotal/1000 so numbers are not 00000000)


## THEN CONVERT RESULTS TO MNI SPACE---   AAH CHA!! OK


## THEN ADD EM UP AND MAKE A MAP...

config.update_config(cfg)

cfg = dict(execution={'remove_unnecessary_outputs': False,
                      'keep_inputs': True},
           monitoring={'enabled': True,
                       'sample_frequency': 5}
          )




### Had a default but we deleted it for now
### TScaling was = 100000
# def getWaytotal(in_file, Tscaling): 
#     import subprocess
#     import re
    
#     in_file= re.sub('fdt_paths.nii.gz', 'waytotal', in_file)
#     mycommand= "cat "+str(in_file)
#     mycommand= mycommand.split(sep=' ')
#     result= subprocess.run(mycommand, stdout=subprocess.PIPE)
#     tmpwaytotal= result.stdout.decode("utf-8").split(' ')[0]
#     print('waytotal: %s' % tmpwaytotal)
    
#     if(not tmpwaytotal): 
#         print('Waytotal Empty for: %s' % pathwaytotal)
#     else:
#         waytotals= float(tmpwaytotal) / Tscaling                
#         return( waytotals )



