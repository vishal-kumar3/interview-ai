"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Save, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { z } from "zod"

interface JsonPreviewModalProps {
  title: string
  description?: string
  data: any
  schema: z.ZodSchema<any>
  isOpen: boolean
  onClose: () => void
  onUpdate: (data: any) => Promise<{ success?: boolean; error?: string; message?: string }>
  fieldConfig?: FieldConfig
}

interface FieldConfig {
  [key: string]: {
    label?: string
    type?: "text" | "number" | "select" | "array" | "object"
    options?: string[]
    itemName?: string
    hidden?: boolean
    sections?: {
      [sectionKey: string]: {
        title: string
        fields: string[]
        className?: string
      }
    }
  }
}

export function JsonPreviewModal({
  title,
  description,
  data: initialData,
  schema,
  isOpen,
  onClose,
  onUpdate,
  fieldConfig = {}
}: JsonPreviewModalProps) {
  const [data, setData] = useState(initialData)
  const [originalData, setOriginalData] = useState(initialData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  // Check if data has changed
  useEffect(() => {
    setHasChanges(JSON.stringify(data) !== JSON.stringify(originalData))
  }, [data, originalData])

  // Update data when initialData changes
  useEffect(() => {
    setData(initialData)
    setOriginalData(initialData)
  }, [initialData])

  const handleSave = async () => {
    try {
      setIsLoading(true)

      // Validate data with provided Zod schema
      const validatedData = schema.parse(data)

      // Call the update function
      const result = await onUpdate(validatedData)

      if (result.success) {
        toast.success(result.message || "Data updated successfully!")
        setOriginalData(data)
        setHasChanges(false)
        onClose()
      } else {
        toast.error(result.error || "Failed to update data")
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        toast.error(`Validation error: ${errorMessages}`)
      } else if (error instanceof Error) {
        toast.error(`Error: ${error.message}`)
      } else {
        toast.error("Failed to save changes")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setData(originalData)
    setHasChanges(false)
    setEditingField(null)
  }

  // Get field configuration
  const getFieldConfig = (path: string) => {
    return fieldConfig[path] || {}
  }

  // Extract enum options from Zod schema
  const getEnumFromSchema = (schemaOrDef: any): string[] => {
    if (!schemaOrDef) return []

    // Handle ZodEnum
    if (schemaOrDef._def?.typeName === 'ZodEnum') {
      return schemaOrDef._def.values
    }

    // Handle ZodNativeEnum
    if (schemaOrDef._def?.typeName === 'ZodNativeEnum') {
      return Object.values(schemaOrDef._def.values)
    }

    return []
  }

  // Get type information from Zod schema
  const getSchemaType = (value: any, path: string) => {
    const config = getFieldConfig(path)

    // Check if config specifies enum options
    if (config.options?.length) {
      return { type: 'select', options: config.options }
    }

    // Infer from value type
    if (typeof value === 'boolean') {
      return { type: 'select', options: ['true', 'false'] }
    }

    if (typeof value === 'number') {
      return { type: 'number', options: [] }
    }

    if (Array.isArray(value)) {
      return { type: 'array', options: [] }
    }

    return { type: 'text', options: [] }
  }

  // Create appropriate default item for arrays
  const createDefaultArrayItem = (existingItems: any[], path: string) => {
    const config = getFieldConfig(path)

    if (existingItems.length > 0) {
      const firstItem = existingItems[0]

      if (typeof firstItem === 'string') {
        return `New ${config.itemName || 'item'}`
      }

      if (typeof firstItem === 'object' && firstItem !== null) {
        // Create a new object with the same structure but default values
        const newItem: any = {}
        Object.keys(firstItem).forEach(key => {
          const value = firstItem[key]
          if (typeof value === 'string') {
            newItem[key] = `New ${key.replace(/_/g, ' ')}`
          } else if (typeof value === 'number') {
            newItem[key] = 0
          } else if (typeof value === 'boolean') {
            newItem[key] = false
          } else if (Array.isArray(value)) {
            newItem[key] = []
          } else if (typeof value === 'object' && value !== null) {
            newItem[key] = {}
          } else {
            newItem[key] = value
          }
        })
        return newItem
      }
    }

    // Fallback defaults
    return `New ${config.itemName || 'item'}`
  }

  // Editable field component
  const EditableField = ({
    value,
    path,
    placeholder = "",
    className = ""
  }: {
    value: any
    path: string
    placeholder?: string
    className?: string
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    const schemaType = getSchemaType(value, path)
    const { type: fieldType, options } = schemaType

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsEditing(true)
      setEditingField(path)
      setTempValue(value)
    }

    const handleSaveField = () => {
      const pathArray = path.split('.')
      const newData = { ...data }
      let current: any = newData

      // Navigate to the parent object
      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i]
        if (key.includes('[') && key.includes(']')) {
          const arrayKey = key.split('[')[0]
          const index = parseInt(key.split('[')[1].split(']')[0])
          if (!current[arrayKey]) current[arrayKey] = []
          current = current[arrayKey][index]
        } else {
          if (!current[key]) current[key] = {}
          current = current[key]
        }
      }

      // Set the final value
      const finalKey = pathArray[pathArray.length - 1]
      let finalValue = tempValue

      // Handle type conversions
      if (fieldType === "number") {
        finalValue = Number(tempValue)
      } else if (tempValue === 'true') {
        finalValue = true
      } else if (tempValue === 'false') {
        finalValue = false
      }

      current[finalKey] = finalValue
      setData(newData)
      setIsEditing(false)
      setEditingField(null)
    }

    const handleCancel = () => {
      setTempValue(value)
      setIsEditing(false)
      setEditingField(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSaveField()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }

    // Format display value
    const formatDisplayValue = (val: any) => {
      if (val === null || val === undefined) {
        return placeholder || "Click to edit"
      }

      if (typeof val === 'boolean') {
        return val ? 'Yes' : 'No'
      }

      if (typeof val === 'string' && fieldType === "select") {
        return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
      }

      return String(val)
    }

    if (isEditing) {
      if (fieldType === "select") {
        return (
          <div className="inline-block">
            <Select value={String(tempValue)} onValueChange={(selectedValue) => {
              // Immediate save for select
              const pathArray = path.split('.')
              const newData = { ...data }
              let current: any = newData

              for (let i = 0; i < pathArray.length - 1; i++) {
                const key = pathArray[i]
                if (key.includes('[') && key.includes(']')) {
                  const arrayKey = key.split('[')[0]
                  const index = parseInt(key.split('[')[1].split(']')[0])
                  current = current[arrayKey][index]
                } else {
                  current = current[key]
                }
              }

              const finalKey = pathArray[pathArray.length - 1]
              let finalValue: any = selectedValue

              if (selectedValue === 'true') {
                finalValue = true
              } else if (selectedValue === 'false') {
                finalValue = false
              }

              current[finalKey] = finalValue
              setData(newData)
              setIsEditing(false)
              setEditingField(null)
            }}>
              <SelectTrigger className="inline-flex w-auto min-w-[120px] h-6 border-0 bg-blue-50 text-blue-700 p-1 text-sm font-medium shadow-none focus:ring-1 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === 'true' ? 'Yes' :
                     option === 'false' ? 'No' :
                     option.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )
      }

      return (
        <Input
          ref={inputRef}
          type={fieldType}
          value={String(tempValue)}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSaveField}
          onKeyDown={handleKeyDown}
          className="inline-block w-auto min-w-[100px] h-6 border-0 bg-blue-50 text-blue-700 p-1 text-sm font-medium shadow-none focus:ring-1 focus:ring-blue-500"
          placeholder={placeholder}
        />
      )
    }

    return (
      <span
        onDoubleClick={handleDoubleClick}
        className={cn(
          "inline-block cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-1 py-0.5 rounded transition-colors border border-transparent hover:border-blue-200",
          !value && "text-gray-400 italic",
          className
        )}
        title="Double-click to edit"
      >
        {formatDisplayValue(value)}
      </span>
    )
  }

  // Array field component
  const ArrayField = ({
    items,
    path,
    renderItem,
    itemName = "item"
  }: {
    items: any[]
    path: string
    renderItem: (item: any, index: number) => React.ReactNode
    itemName?: string
  }) => {
    const addItem = () => {
      const pathArray = path.split('.')
      const newData = { ...data }
      let current: any = newData

      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) current[pathArray[i]] = {}
        current = current[pathArray[i]]
      }

      const arrayKey = pathArray[pathArray.length - 1]
      if (!current[arrayKey]) current[arrayKey] = []

      const newItem = createDefaultArrayItem(current[arrayKey], path)
      current[arrayKey] = [...current[arrayKey], newItem]
      setData(newData)
    }

    const removeItem = (index: number) => {
      const pathArray = path.split('.')
      const newData = { ...data }
      let current: any = newData

      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]]
      }

      const arrayKey = pathArray[pathArray.length - 1]
      current[arrayKey] = current[arrayKey].filter((_: any, i: number) => i !== index)
      setData(newData)
    }

    return (
      <div className="space-y-3">
        {items?.map((item, index) => (
          <div key={index} className="flex items-start gap-2 group relative">
            <div className="flex-1">
              {renderItem(item, index)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="opacity-70 group-hover:opacity-100 transition-opacity p-1 h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
              title={`Remove ${itemName}`}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="mt-2 text-teal-600 border-teal-300 hover:bg-teal-50 h-7"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add {itemName}
        </Button>
      </div>
    )
  }

  // Render different field types - much simpler now!
  const renderField = (value: any, path: string, label?: string) => {
    const config = getFieldConfig(path)

    if (config.hidden) return null

    if (Array.isArray(value)) {
      return (
        <ArrayField
          items={value}
          path={path}
          itemName={config.itemName || "item"}
          renderItem={(item, index) => {
            if (typeof item === 'string') {
              return (
                <EditableField
                  value={item}
                  path={`${path}[${index}]`}
                  placeholder={`${config.itemName || 'Item'} ${index + 1}`}
                />
              )
            }
            return renderObject(item, `${path}[${index}]`)
          }}
        />
      )
    }

    if (typeof value === 'object' && value !== null) {
      return renderObject(value, path)
    }

    return (
      <EditableField
        value={value}
        path={path}
        placeholder={label || path.split('.').pop()}
      />
    )
  }

  // Render object with proper structure
  const renderObject = (obj: any, basePath: string = '') => {
    if (!obj) return null

    return (
      <div className="space-y-3">
        {Object.entries(obj).map(([key, value]) => {
          const path = basePath ? `${basePath}.${key}` : key
          const config = getFieldConfig(path)
          const label = config.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

          if (config.hidden) return null

          return (
            <div key={key} className="space-y-1">
              <span className="font-medium text-gray-700 text-sm">{label}: </span>
              {renderField(value, path, label)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>{title}</span>
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description} • Double-click any value to edit
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            {renderObject(data)}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="h-3 w-3" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
