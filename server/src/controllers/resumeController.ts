import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { ResumeModel } from '../models/ResumeModel';
import type{ IProfileSchema } from '../types';

export const addResume = async (req: Request, res: Response) => {
  try {
    // Extract resume data from the nested structure
    const resumeData: IProfileSchema = req.body;
    
    // Validate the resume data
    if (!resumeData || Object.keys(resumeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }

    // Check if the email is provided
    if (!resumeData.personal || !resumeData.personal.email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // check if resume is already there
    const existingResume = await ResumeModel.findOne({'personal.email': resumeData.personal.email});

    if (existingResume) {
      return res.status(400).json({
        success: false,
        message: 'Resume already exists for this email'
      });
    }

    // console.log('Resume data:', resumeData);

    const newResume = {
      ...resumeData,
      _id: new Types.ObjectId()
    }
    // Create a new resume document
    await ResumeModel.create(newResume);

    res.status(201).json({
      success: true,
      message: 'Resume added successfully',
      data: newResume
    });

  } catch (error) {
    console.error('Error adding resume:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding resume to database',
      error: error instanceof Error && error.message 
    });
  }
};

export const getResume = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    // Find resume by email
    const resume = await ResumeModel.findOne({'personal.email': email});
    
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
      error: error instanceof Error && error.message 
    });
  }
};

export const deleteResume = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    // Find and delete resume by email
    const deletedResume = await ResumeModel.findOneAndDelete({'personal.email': email});
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
      error: error instanceof Error && error.message
    });
  }
};

export const updateResume = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const resumeData: IProfileSchema = req.body;

    // Validate the resume data
    if (!resumeData || Object.keys(resumeData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }

    // Find and update resume by email
    const updatedResume = await ResumeModel.findOneAndUpdate(
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
      error: error instanceof Error && error.message 
    });
  }
};

