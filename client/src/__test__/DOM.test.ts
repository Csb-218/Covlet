import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest'
import { getMessageBox, getJobDetails, canInjectIcon } from '../utils/DOM'
import { fakeBrowser } from "wxt/testing";
import { JSDOM } from 'jsdom';


describe('DOM utilities', () => {

  beforeEach(() => {
    fakeBrowser.reset();
    // Clear the document body before each test
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = ''
  })

  describe('getMessageBox', () => {
    it('should return the first textarea element', () => {
      // Arrange
      const textarea = document.createElement('textarea')
      textarea.id = 'test-textarea'
      document.body.appendChild(textarea)

      // Act
      const result = getMessageBox()

      // Assert
      expect(result).toBe(textarea)
      expect(result?.tagName).toBe('TEXTAREA')
    })

    it('should return the first textarea when multiple exist', () => {
      // Arrange
      const textarea1 = document.createElement('textarea')
      textarea1.id = 'first'
      const textarea2 = document.createElement('textarea')
      textarea2.id = 'second'
      
      document.body.appendChild(textarea1)
      document.body.appendChild(textarea2)

      // Act
      const result = getMessageBox()

      // Assert
      expect(result).toBe(textarea1)
      expect(result?.id).toBe('first')
    })

    it('should return null when no textarea exists', () => {
      // Act
      const result = getMessageBox()

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('getJobDetails', () => {
    it('should extract job details correctly when all elements exist', () => {
      // Arrange
      // Create "About the job" section
      const jobSection = document.createElement('div')
      const heading = document.createElement('h2')
      heading.textContent = 'About the job'
      const jobContent = document.createTextNode('This is a great job opportunity...')
      jobSection.appendChild(heading)
      jobSection.appendChild(jobContent)

      // Create job role section
      const jobRoleDiv = document.createElement('div')
      jobRoleDiv.setAttribute('data-test', 'JobListingSlideIn')
      const jobTitle = document.createElement('h1')
      jobTitle.textContent = 'Senior Developer'
      jobRoleDiv.appendChild(jobTitle)

      // Create company section
      const companyHeading = document.createElement('h3')
      companyHeading.textContent = 'Tech Corp Inc.'

      document.body.appendChild(jobSection)
      document.body.appendChild(jobRoleDiv)
      document.body.appendChild(companyHeading)

      // Act
      const result = getJobDetails()

      // Assert
      expect(result.aboutTheJobSection).toContain('About the job')
      expect(result.aboutTheJobSection).toContain('This is a great job opportunity...')
      expect(result.jobRole).toBe('Senior Developer')
      expect(result.company).toBe('Tech Corp Inc.')
    })

    it('should return empty strings when elements do not exist', () => {
      // Act
      const result = getJobDetails()

      // Assert
      expect(result.aboutTheJobSection).toBe('')
      expect(result.jobRole).toBe('')
      expect(result.company).toBe('')
    })

    it('should handle missing job role div gracefully', () => {
      // Arrange
      const heading = document.createElement('h2')
      heading.textContent = 'About the job'
      const companyHeading = document.createElement('h3')
      companyHeading.textContent = 'Tech Corp Inc.'

      document.body.appendChild(heading)
      document.body.appendChild(companyHeading)

      // Act
      const result = getJobDetails()

      // Assert
      expect(result.jobRole).toBe('')
      expect(result.company).toBe('Tech Corp Inc.')
    })

    it('should handle missing company heading gracefully', () => {
      // Arrange
      const jobRoleDiv = document.createElement('div')
      jobRoleDiv.setAttribute('data-test', 'JobListingSlideIn')
      const jobTitle = document.createElement('h1')
      jobTitle.textContent = 'Senior Developer'
      jobRoleDiv.appendChild(jobTitle)

      document.body.appendChild(jobRoleDiv)

      // Act
      const result = getJobDetails()

      // Assert
      expect(result.jobRole).toBe('Senior Developer')
      expect(result.company).toBe('')
      expect(result.aboutTheJobSection).toBe('')
    })

    it('should find correct h2 when multiple h2 elements exist', () => {
      // Arrange
      const irrelevantH2 = document.createElement('h2')
      irrelevantH2.textContent = 'Other heading'
      
      const jobSection = document.createElement('div')
      const correctH2 = document.createElement('h2')
      correctH2.textContent = 'About the job'
      const jobContent = document.createTextNode('Job description here')
      jobSection.appendChild(correctH2)
      jobSection.appendChild(jobContent)

      document.body.appendChild(irrelevantH2)
      document.body.appendChild(jobSection)

      // Act
      const result = getJobDetails()

      // Assert
      expect(result.aboutTheJobSection).toContain('About the job')
      expect(result.aboutTheJobSection).toContain('Job description here')
    })

    it('should trim whitespace from extracted text', () => {
      // Arrange
      const jobRoleDiv = document.createElement('div')
      jobRoleDiv.setAttribute('data-test', 'JobListingSlideIn')
      const jobTitle = document.createElement('h1')
      jobTitle.textContent = '   Senior Developer   '
      jobRoleDiv.appendChild(jobTitle)

      const companyHeading = document.createElement('h3')
      companyHeading.textContent = '   Tech Corp Inc.   '

      document.body.appendChild(jobRoleDiv)
      document.body.appendChild(companyHeading)

      // Act
      const result = getJobDetails()

      // Assert
      expect(result.jobRole).toBe('Senior Developer')
      expect(result.company).toBe('Tech Corp Inc.')
    })
  })

  describe('canInjectIcon', () => {
    it('should return true when messageBox parent has exactly one child', () => {
      // Arrange
      const parent = document.createElement('div')
      const textarea = document.createElement('textarea')
      parent.appendChild(textarea)
      document.body.appendChild(parent)

      // Act
      const result = canInjectIcon(textarea)

      // Assert
      expect(result).toBe(true)
    })

    it('should return false when messageBox parent has multiple children', () => {
      // Arrange
      const parent = document.createElement('div')
      const textarea = document.createElement('textarea')
      const otherElement = document.createElement('span')
      
      parent.appendChild(textarea)
      parent.appendChild(otherElement)
      document.body.appendChild(parent)

      // Act
      const result = canInjectIcon(textarea)

      // Assert
      expect(result).toBe(false)
    })

    it('should return false when messageBox is null', () => {
      // Act
      const result = canInjectIcon(null)

      // Assert
      expect(result).toBe(false)
    })

    it('should return false when messageBox has no parent', () => {
      // Arrange
      const textarea = document.createElement('textarea')
      // Don't append to any parent

      // Act
      const result = canInjectIcon(textarea)

      // Assert
      expect(result).toBe(false)
    })

    it('should return false when messageBox parent has no children', () => {
      // Arrange
      const parent = document.createElement('div')
      const textarea = document.createElement('textarea')
      
      // Add textarea to parent, then remove it
      parent.appendChild(textarea)
      parent.removeChild(textarea)
      
      // Act
      const result = canInjectIcon(textarea)

      // Assert
      expect(result).toBe(false)
    })
  })
})