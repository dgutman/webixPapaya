/*This contains sample NIFTI data sets;  each tag contains data that has the same 
image dimensions; data model is still evolving

imageTypes include Mask, baseImage, ROI

a Mask Image normally has values from 0 -1
a baseImage is usually rendered in gray
an ROI could have a defaultColor, but otherwise it could be green/red/blue
*/


/* TO DO: NEED TO MOVE THE SLIDER */

var sampleDataSets = {
        "MNI_1mm": [
            { path: "sampleData/MNI152_T1_1mm.nii.gz", name: "MNI152_T1_1mm", imageType: "baseImage" },
            { path: "sampleData/MNI152_T1_1mm_brain.nii.gz", name: "MNI152_T1_1mm_brain", imageType: "baseImage" },
            { path: "sampleData/MNI152_T1_1mm_brain_mask.nii.gz", name: "MNI152_T1_1mm_brain_mask", imageType: "mask" },
            { path: "sampleData/MNI152_T1_1mm_Hipp_mask_dil8.nii.gz", name: "MNI152_T1_1mm_Hipp_mask_dil8", imageType: "mask" },
            { path: "sampleData/MNI152_T1_1mm_brain_mask_dil.nii.gz", name: "MNI152_T1_1mm_brain_mask_dil", imageType: "mask" }
        ],
            "MNI_2mm": [
                { path: "sampleData/MNI152_T1_2mm.nii.gz", name: "MNI152_T1_2mm", imageType: "baseImage" }
            ]
        }

//I think I'll add some helper functions to set some parameters that become the defaults
//based on being part of a common data set (i.e. give diff ROI's diff default colors)
//make masks go from 0,1 etc...


        // sampleData/MNI152_T1_0.5mm.nii.gz
        // sampleData/MNI152_T1_1mm_brain_mask_dil.nii.gz
        // sampleData/MNI152_T1_1mm_brain_mask.nii.gz
        // sampleData/MNI152_T1_1mm_brain.nii.gz
        // sampleData/MNI152_T1_1mm_first_brain_mask.nii.gz
        // sampleData/MNI152_T1_1mm_Hipp_mask_dil8.nii.gz
        // sampleData/MNI152_T1_1mm.nii.gz
        // sampleData/MNI152_T1_2mm_b0.nii.gz
        // sampleData/MNI152_T1_2mm_brain_mask_deweight_eyes.nii.gz
        // sampleData/MNI152_T1_2mm_brain_mask_dil1.nii.gz
        // sampleData/MNI152_T1_2mm_brain_mask_dil.nii.gz
        // sampleData/MNI152_T1_2mm_brain_mask.nii.gz
        // sampleData/MNI152_T1_2mm_brain.nii.gz
        // sampleData/MNI152_T1_2mm_edges.nii.gz
        // sampleData/MNI152_T1_2mm_eye_mask.nii.gz
        // sampleData/MNI152_T1_2mm_LR-masked.nii.gz
        // sampleData/MNI152_T1_2mm.nii.gz
        // sampleData/MNI152_T1_2mm_skull.nii.gz
        // sampleData/MNI152_T1_2mm_strucseg.nii.gz
        // sampleData/MNI152_T1_2mm_strucseg_periph.nii.gz
        // sampleData/MNI152_T1_2mm_VentricleMask.nii.gz