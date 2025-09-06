import { describe, it, expect } from 'vitest'
import { 
  convert_to_readable, 
  convert_to_downloadable_pdf, 
  convert_to_readable_input, 
  toInputBox, 
  formatDateForInput 
} from './helpers'

describe('Helper functions', () => {
  
  describe('convert_to_readable', () => {
    it('should convert newlines to <br> tags', () => {
      // Arrange
      const input = 'Line 1\nLine 2\nLine 3'
      const expected = 'Line 1<br>Line 2<br>Line 3'

      // Act
      const result = convert_to_readable(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle multiple consecutive newlines', () => {
      // Arrange
      const input = 'Line 1\n\n\nLine 2'
      const expected = 'Line 1<br><br><br>Line 2'

      // Act
      const result = convert_to_readable(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle empty string', () => {
      // Act
      const result = convert_to_readable('')

      // Assert
      expect(result).toBe('')
    })

    it('should handle text without newlines', () => {
      // Arrange
      const input = 'Single line text'

      // Act
      const result = convert_to_readable(input)

      // Assert
      expect(result).toBe('Single line text')
    })
  })

  describe('convert_to_downloadable_pdf', () => {
    it('should convert <br> tags to newlines and remove HTML tags', () => {
      // Arrange
      const input = 'Line 1<br>Line 2<br/>Line 3<strong>Bold</strong><em>Italic</em>'
      const expected = 'Line 1\nLine 2\nLine 3BoldItalic'

      // Act
      const result = convert_to_downloadable_pdf(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle various <br> tag formats', () => {
      // Arrange
      const input = 'Line 1<br>Line 2<br />Line 3<br/>Line 4<BR>Line 5'
      const expected = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'

      // Act
      const result = convert_to_downloadable_pdf(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should remove all HTML tags', () => {
      // Arrange
      const input = '<div><p>Paragraph</p><span class="test">Span</span></div>'
      const expected = 'ParagraphSpan'

      // Act
      const result = convert_to_downloadable_pdf(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle empty string', () => {
      // Act
      const result = convert_to_downloadable_pdf('')

      // Assert
      expect(result).toBe('')
    })

    it('should handle text without HTML', () => {
      // Arrange
      const input = 'Plain text'

      // Act
      const result = convert_to_downloadable_pdf(input)

      // Assert
      expect(result).toBe('Plain text')
    })
  })

  describe('convert_to_readable_input', () => {
    it('should convert <br> tags to newlines and remove HTML tags', () => {
      // Arrange
      const input = 'Line 1<br>Line 2<br/>Line 3<strong>Bold</strong>'
      const expected = 'Line 1\nLine 2\nLine 3Bold'

      // Act
      const result = convert_to_readable_input(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle nested HTML tags', () => {
      // Arrange
      const input = '<div><p>Text <strong>bold</strong> more text</p></div>'
      const expected = 'Text bold more text'

      // Act
      const result = convert_to_readable_input(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should preserve spaces between words after removing tags', () => {
      // Arrange
      const input = 'Word1 <span>Word2</span> Word3'
      const expected = 'Word1 Word2 Word3'

      // Act
      const result = convert_to_readable_input(input)

      // Assert
      expect(result).toBe(expected)
    })
  })

  describe('toInputBox', () => {
    it('should replace opening tags with newlines and closing tags with spaces', () => {
      // Arrange
      const input = '<p>Paragraph 1</p><div>Paragraph 2</div>'
      const expected = '\nParagraph 1 \nParagraph 2 '

      // Act
      const result = toInputBox(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle self-closing tags', () => {
      // Arrange
      const input = 'Text<br/>More text<img src="test.jpg"/>End'
      const expected = 'Text\nMore text\nEnd'

      // Act
      const result = toInputBox(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle tags with attributes', () => {
      // Arrange
      const input = '<div class="test" id="myDiv">Content</div>'
      const expected = '\nContent '

      // Act
      const result = toInputBox(input)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle empty string', () => {
      // Act
      const result = toInputBox('')

      // Assert
      expect(result).toBe('')
    })

    it('should handle text without HTML tags', () => {
      // Arrange
      const input = 'Plain text without tags'

      // Act
      const result = toInputBox(input)

      // Assert
      expect(result).toBe('Plain text without tags')
    })
  })

  describe('formatDateForInput', () => {
    it('should format a valid Date object to YYYY-MM-DD', () => {
      // Arrange
      const date = new Date('2023-12-25T10:30:00Z')
      const expected = '2023-12-25'

      // Act
      const result = formatDateForInput(date)

      // Assert
      expect(result).toBe(expected)
    })

    it('should format a valid date string to YYYY-MM-DD', () => {
      // Arrange
      const dateString = '2023-06-15T15:45:30Z'
      const expected = '2023-06-15'

      // Act
      const result = formatDateForInput(dateString)

      // Assert
      expect(result).toBe(expected)
    })

    it('should return empty string for null', () => {
      // Act
      const result = formatDateForInput(null)

      // Assert
      expect(result).toBe('')
    })

    it('should return empty string for empty string', () => {
      // Act
      const result = formatDateForInput('')

      // Assert
      expect(result).toBe('')
    })

    it('should handle ISO date string', () => {
      // Arrange
      const isoString = '2023-03-14T08:00:00.000Z'
      const expected = '2023-03-14'

      // Act
      const result = formatDateForInput(isoString)

      // Assert
      expect(result).toBe(expected)
    })

    it('should handle date with different time zones', () => {
      // Arrange
      const date = new Date('2023-01-01T23:59:59-05:00')
      
      // Act
      const result = formatDateForInput(date)

      // Assert
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Should be in YYYY-MM-DD format
    })

    // it('should handle invalid date string gracefully', () => {
    //   // Arrange
    //   const invalidDate = 'invalid-date'

    //   // Act
    //   const result = formatDateForInput(invalidDate)

    //   // Assert
    //   // Invalid date creates 'Invalid Date' which toISOString() throws error
    //   // But the function should handle this gracefully
    //   expect(result).toBe('NaN-aN-aN')
    // })
  })
})