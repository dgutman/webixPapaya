#%% Change working directory from the workspace root to the ipynb file location. Turn this addition off with the DataScience.changeDirOnImportExport setting
import os
try:
	os.chdir(os.path.join(os.getcwd(), 'helper'))
	print(os.getcwd())
except:
	pass

#%%
### This will sync data that is on FRINK to a girder instance (computable brain)
import girder_client
import sys,os,glob


#%%
cbGirder = girder_client.GirderClient(apiUrl="http://candygram.neurology.emory.edu:8080/api/v1")
cbGirder.authenticate(interactive=True)



#%%
### This is where I will post individual subjects data that is in DTI Space
subjDTIPath = "/collection/FG/HCP_TractographyData/SubjectRegistrationResults/DTI_Space"
subjDtiTarget = cbGirder.get("resource/lookup?path=" + subjDTIPath)


#%%
### Where the raw Subject Data is located
subjRootDir = "/data/HCP_BedpostData/"
subjList = [x for x in os.listdir(subjRootDir) if 'addlInfo' not in x]
print(len(subjList),"Subjects have Bedpost Data")
diffData = "/T1w/Diffusion/nodif*"  ### This will find nodif brain images which I use to show DTI Data



for s in subjList[0:10]: ### Just going to grab the first ten subjects
    grdrTgtSubjFolder = cbGirder.createFolder(subjDtiTarget['_id'],name=s,
                                description="Subject %s DTI Space Images" % s,reuseExisting=True)
        
    ## Get the Items in the current subject folder; we can double check the items we are trying to upload match
    ## What's on our server
    itemsInSubjFolder = list(cbGirder.listItem(grdrTgtSubjFolder['_id']))
    ### Turn this into a dictionary so I can compare what's on my file system
    ### To what's in girder.. and then decide if I should upload it or not..
    curSubjFiles = [ (x['name'],x['size']) for  x  in itemsInSubjFolder  ]

    #Get a list of the DTI base images on the server i.e. my FILE system.. not actually in girder
    dtiBaseFiles = glob.glob(subjRootDir+s+diffData)
    for f in dtiBaseFiles:
        ### Check and see if there's already an item in this folder that matches what I am trying to upload..
        if((os.path.basename(f),os.path.getsize(f) ) in curSubjFiles):
            #print("File appears to already be uploaded....")
            continue
        else:
            grdrItemInfo = cbGirder.uploadFileToFolder(grdrTgtSubjFolder['_id'],f,filename=os.path.basename(f))

            ### TO DO: Debate if I check/add/update metadata or not
            ## LETS POST SOME METADATA As well.. including in the near future the fslSTATS data Felipe Wants
            cbGirder.addMetadataToItem(grdrItemInfo['itemId'],{"XTK":{"type":"volume2d"}})
           


#%%
# ### Let's also load the MNI masks converted to DTI space for this subject cohort

# ### Where the raw Subject Data is located
subjRootDir = "/data/HCP_BedpostData/"
dtiSpaceMasks = "addlInfo/%s/DTI_ROIs/*"  ### This will find nodif brain images which I use to show DTI Data



for s in subjList[0:10]: ### Just going to grab the first ten subjects
    grdrTgtSubjFolder = cbGirder.createFolder(subjDtiTarget['_id'],name=s,
                                description="Subject %s DTI Space Images" % s,reuseExisting=True)

    grdrDTIROISubjFolder = cbGirder.createFolder(grdrTgtSubjFolder['_id'],name='DTI_ROIs',
                            description="Subject %s DTI Space ROIs" % s,reuseExisting=True)

    
    
#     ## Get the Items in the current subject DTI ROI folder; we can double check the items we are trying to upload match
#     ## What's on our server
    itemsInROIFolder = list(cbGirder.listItem(grdrDTIROISubjFolder['_id']))
    ### Turn this into a dictionary so I can compare what's on my file system
    ### To what's in girder.. and then decide if I should upload it or not..
    curSubjFiles = [ (x['name'],x['size']) for  x  in itemsInROIFolder  ]

    #Get a list of the DTI base images on the server i.e. my FILE system.. not actually in girder
    
    dtiBaseFiles = glob.glob(subjRootDir+dtiSpaceMasks%s)
    for f in dtiBaseFiles:
        ### Check and see if there's already an item in this folder that matches what I am trying to upload..
        if((os.path.basename(f),os.path.getsize(f) ) in curSubjFiles):
            #print("File appears to already be uploaded....")
            continue
        else:
            grdrItemInfo = cbGirder.uploadFileToFolder(grdrDTIROISubjFolder['_id'],f,filename=os.path.basename(f))

            ### TO DO: Debate if I check/add/update metadatar not
            ## LETS POST SOME METADATA As well.. including in the near future the fslSTATS data Felipe Wants
            cbGirder.addMetadataToItem(grdrItemInfo['itemId'],{"XTK":{"type":"volume2d"}})
           


#%%
### Now the fun part... let's create a SPEC for each Folder that shows how we want to visualize/load it..

## For the DTI base data, we want the nodif to be first, nodif_brain to be second, nodif_brain_mask to be third...

dtiFilesForPapaya = ['nodif.nii.gz','nodif_brain.nii.gz','nodif_brain_mask.nii.gz']




for s in subjList[0:10]: ### Just going to grab the first ten subjects
    papayaSpecDataDict = {}
    
    grdrTgtSubjFolder = list(cbGirder.listFolder(subjDtiTarget['_id'],name=s))
    itemsInSubjFolder = list(cbGirder.listItem(grdrTgtSubjFolder[0]['_id']))
    
    for i in itemsInSubjFolder:
        #print(i)
        if i['name'] in dtiFilesForPapaya:
            ### Populate the spec info now...
            ##g# Need to get the fileID for this item...
            itemFiles = cbGirder.listFile(i['_id'])
            ##an item can have one or more files in it... this is complicated!

            grdrFileId = None
            for itf in itemFiles:
                if itf['name'] == i['name']:
                    grdrFileId = itf['_id']
                    break
            
            papayaSpecDataDict[i['name']] = { 'displayName': i['name'].replace('nii.gz',''), 'grdrFileId': grdrFileId,
                                                "alpha": 1, "visible": 1}
            
#    print(papayaSpecDataDict)
    ## This is what we ACTUALY want to post.. so it's in order
    for d in dtiFilesForPapaya:
        if d in papayaSpecDataDict:
            papayaSpec.append( papayaSpecDataDict[d]  )
    cbGirder.addMetadataToFolder(grdrTgtSubjFolder[0]['_id'], {"papayaSpec":papayaSpec})
    


#%%

#     # Now either upload the local files and see if there are already files on girder.


#     for f in dtiBaseFiles:
#         print(f)
#         print(grdrTgtSubjFolder)
    
#     ## So for each subject, I need to first either create or get the folder ID that I'm going to upload these items into
    
    
    


