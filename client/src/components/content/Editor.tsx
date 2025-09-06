// src/Tiptap.tsx
import {useState , useEffect} from 'react'
import { useEditor ,EditorProvider,EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'

// define your extension array
const extensions = [StarterKit]

interface EditorProps {
  onChange: (value: string) => void;
  content: string
}

const Editor = ({onChange,content}:EditorProps) => {

  const editor = useEditor({
    extensions,
    content,
    onUpdate(props) {
      const html = props.editor.getHTML();
      onChange(html);
      // console.log('Editor content updated:', html);
    },
  })

   useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  

  


  return (
    <>
      <EditorContent editor={editor} content={content} />
      {/* <FloatingMenu editor={editor} shouldShow={()=>true}>This is the floating menu</FloatingMenu> */}
      {/* <BubbleMenu editor={editor} shouldShow={()=>true}>This is the bubble menu</BubbleMenu> */}
    </>
  )
}

export default Editor