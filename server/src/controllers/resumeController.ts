import { Request, Response } from 'express';
import { Resume } from '../models/ResumeModel';
import type{ IProfileSchema } from '../types';

export const addResume = async (req: Request, res: Response) => {
  try {
    // Extract resume data from the nested structure
    const resumeData: IProfileSchema = req.body.resume;
     
    if (!resumeData) {
      return res.status(400).json({
        success: false,
        message: 'Resume data is required'
      });
    }

    // check if resume is already there
    const existingResume = await Resume.findOne({'personal.email': resumeData.personal.email});
    if (existingResume) {
      return res.status(400).json({
        success: false,
        message: 'Resume already exists for this email'
      });
    }

    console.log('Resume data:', resumeData);
    
    // Create a new resume document
    const resume = new Resume(resumeData);
    console.log('Resume document:', resume);
    
    // Save to database
    const savedResume = await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume added successfully',
      data: savedResume
    });

  } catch (error) {
    console.error('Error adding resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding resume to database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getResume = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    // Find resume by email
    const resume = await Resume.findOne({'personal.email': email});
    
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });

  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume from database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    // Find and delete resume by email
    const deletedResume = await Resume.findOneAndDelete({'personal.email': email});
    if (!deletedResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      data: deletedResume
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume from database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const resumeData: IProfileSchema = req.body;
    console.log('Resume data:', resumeData);
    // Find and update resume by email
    const updatedResume = await Resume.findOneAndUpdate(
      {'personal.email': email},
      resumeData,
      { new: true }
    );

    if (!updatedResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    console.log('Updated resume:', updatedResume);
    res.status(201).json({
      success: true,
      message: 'Resume updated successfully',
      data: updatedResume
    });

  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating resume in database',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

