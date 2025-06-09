"use client"

import { useState, useRef, useEffect } from "react"
import { JobDescription } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Save, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { JobDescriptionParseJsonSchema, type JobDescriptionParseJson } from "@/schema/jobDescription.schema"
import { updateJobDescription } from "@/actions/jobDescription.action"
import { cn } from "@/lib/utils"

interface JobDescriptionPreviewModalProps {
  jobDescription: JobDescription
  isOpen: boolean
  onClose: () => void
}

export function JobDescriptionPreviewModal({
  jobDescription,
  isOpen,
  onClose,
}: JobDescriptionPreviewModalProps) {
  const [data, setData] = useState<JobDescriptionParseJson>(jobDescription.parsedData as JobDescriptionParseJson)
  const [originalData, setOriginalData] = useState<JobDescriptionParseJson>(jobDescription.parsedData as JobDescriptionParseJson)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)

  // Check if data has changed - fix the comparison
  useEffect(() => {
    const currentDataString = JSON.stringify(data)
    const originalDataString = JSON.stringify(originalData)
    setHasChanges(currentDataString !== originalDataString)
  }, [data, originalData])

  // Update data when jobDescription prop changes
  useEffect(() => {
    const newData = jobDescription.parsedData as JobDescriptionParseJson
    setData(newData)
    setOriginalData(JSON.parse(JSON.stringify(newData))) // Deep copy
    setHasChanges(false)
  }, [jobDescription])

  const handleSave = async () => {
    try {
      setIsLoading(true)

      // Validate data with Zod
      const validatedData = JobDescriptionParseJsonSchema.parse(data)

      // Update in database
      const result = await updateJobDescription(jobDescription.id, {
        parsedData: validatedData,
      })

      if (result.success) {
        toast.success(result.message)
        setOriginalData(data)
        setHasChanges(false)
        onClose()
      } else {
        toast.error(result.error || "Failed to update job description")
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Validation error: ${error.message}`)
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

  // Editable field component
  const EditableField = ({
    value,
    path,
    type = "text",
    options = [],
    placeholder = "",
    className = "",
    fieldLabel
  }: {
    value: any
    path: string
    type?: "text" | "number" | "select"
    options?: string[]
    placeholder?: string
    className?: string
      fieldLabel?: string
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempValue, setTempValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    // Get field name from path for tooltip
    const getFieldName = () => {
      if (fieldLabel) return fieldLabel
      const pathParts = path.split('.')
      const lastPart = pathParts[pathParts.length - 1]
      return lastPart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsEditing(true)
      setEditingField(path)
      setTempValue(value)
    }

    const handleSaveField = () => {
      const pathArray = path.split('.')
      const newData = JSON.parse(JSON.stringify(data)) // Deep copy
      let current: any = newData

      // Navigate to the parent object
      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i]
        if (key.includes('[') && key.includes(']')) {
          const arrayKey = key.split('[')[0]
          const index = parseInt(key.split('[')[1].split(']')[0])
          if (!current[arrayKey]) current[arrayKey] = []
          if (!current[arrayKey][index]) current[arrayKey][index] = {}
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
      if (type === "number") {
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

      if (typeof val === 'string' && type === "select") {
        return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
      }

      return String(val)
    }

    if (isEditing) {
      if (type === "select") {
        return (
          <div className="inline-block">
            <Select value={String(tempValue)} onValueChange={(selectedValue) => {
              // Immediate save for select
              const pathArray = path.split('.')
              const newData = JSON.parse(JSON.stringify(data)) // Deep copy
              let current: any = newData

              for (let i = 0; i < pathArray.length - 1; i++) {
                const key = pathArray[i]
                if (key.includes('[') && key.includes(']')) {
                  const arrayKey = key.split('[')[0]
                  const index = parseInt(key.split('[')[1].split(']')[0])
                  if (!current[arrayKey]) current[arrayKey] = []
                  if (!current[arrayKey][index]) current[arrayKey][index] = {}
                  current = current[arrayKey][index]
                } else {
                  if (!current[key]) current[key] = {}
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
          type={type}
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
        onClick={handleClick}
        className={cn(
          "inline-block cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-1 py-0.5 rounded transition-colors border border-transparent hover:border-blue-200",
          !value && "text-gray-400 italic",
          className
        )}
        title={`Click to edit ${getFieldName()}`}
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
    addNewItem,
    itemName = "item"
  }: {
    items: any[]
    path: string
    renderItem: (item: any, index: number) => React.ReactNode
    addNewItem: () => any
    itemName?: string
  }) => {
    const addItem = () => {
      const pathArray = path.split('.')
      const newData = JSON.parse(JSON.stringify(data)) // Deep copy
      let current: any = newData

      for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) current[pathArray[i]] = {}
        current = current[pathArray[i]]
      }

      const arrayKey = pathArray[pathArray.length - 1]
      if (!current[arrayKey]) current[arrayKey] = []
      current[arrayKey] = [...current[arrayKey], addNewItem()]
      setData(newData)
    }

    const removeItem = (index: number) => {
      const pathArray = path.split('.')
      const newData = JSON.parse(JSON.stringify(data)) // Deep copy
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
        {items.map((item, index) => (
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white border-b z-10 pb-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Job Description: {jobDescription.title}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Company: {jobDescription.company} • Click any value to edit
                </DialogDescription>
              </div>
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
                <Button variant="outline" onClick={onClose} size="sm">
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4 space-y-6">
            {/* Job Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Job Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title: </span>
                  <EditableField
                    value={data.jobInfo?.title}
                    path="jobInfo.title"
                    placeholder="Job title"
                    fieldLabel="Job Title"
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Department: </span>
                  <EditableField
                    value={data.jobInfo?.department}
                    path="jobInfo.department"
                    placeholder="Department"
                    fieldLabel="Department"
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Job Level: </span>
                  <EditableField
                    value={data.jobInfo?.jobLevel}
                    path="jobInfo.jobLevel"
                    type="select"
                    options={['ENTRY', 'MID', 'SENIOR', 'PRINCIPAL', 'EXECUTIVE']}
                    fieldLabel="Job Level"
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Employment Type: </span>
                  <EditableField
                    value={data.jobInfo?.employmentType}
                    path="jobInfo.employmentType"
                    type="select"
                    options={['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']}
                    fieldLabel="Employment Type"
                  />
                </div>
              </div>
            </div>

            {/* Skill Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Skill Requirements</h4>
              <ArrayField
                items={data.skillRequirements || []}
                path="skillRequirements"
                itemName="Skill"
                addNewItem={() => ({
                  name: "New Skill",
                  category: "TECHNICAL_HARD",
                  requiredLevel: "INTERMEDIATE",
                  minimumYearsExperience: 1,
                  requirementType: "MUST_HAVE",
                  keywords: ["skill"],
                  assessmentMethods: ["TECHNICAL_TEST"],
                  weight: 5,
                  validationCriteria: {
                    portfolioRequired: false,
                    certificationRequired: false,
                    industryExperienceRequired: false
                  }
                })}
                renderItem={(skill, index) => (
                  <div className="border-l-4 border-blue-500 pl-3 space-y-1 pr-8">
                    <div className="font-medium">
                      <EditableField
                        value={skill.name}
                        path={`skillRequirements[${index}].name`}
                        placeholder="Skill name"
                      />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex flex-wrap items-center gap-1">
                        <span>Category: </span>
                        <EditableField
                          value={skill.category}
                          path={`skillRequirements[${index}].category`}
                          type="select"
                          options={['TECHNICAL_HARD', 'TECHNICAL_SOFT', 'DOMAIN_SPECIFIC', 'LEADERSHIP', 'COMMUNICATION', 'ANALYTICAL', 'CREATIVE', 'OPERATIONAL']}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span>Required Level: </span>
                        <EditableField
                          value={skill.requiredLevel}
                          path={`skillRequirements[${index}].requiredLevel`}
                          type="select"
                          options={['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'MASTER']}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span>Min Years: </span>
                        <EditableField
                          value={skill.minimumYearsExperience}
                          path={`skillRequirements[${index}].minimumYearsExperience`}
                          type="number"
                        />
                        <span> • Requirement: </span>
                        <EditableField
                          value={skill.requirementType}
                          path={`skillRequirements[${index}].requirementType`}
                          type="select"
                          options={['MUST_HAVE', 'NICE_TO_HAVE', 'PREFERRED', 'DEAL_BREAKER']}
                        />
                        <span> • Weight: </span>
                        <EditableField
                          value={skill.weight}
                          path={`skillRequirements[${index}].weight`}
                          type="number"
                        />
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Experience Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Experience Requirements</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Total Years (Minimum): </span>
                  <EditableField
                    value={data.experienceRequirements?.totalYears?.minimum}
                    path="experienceRequirements.totalYears.minimum"
                    type="number"
                  />
                  <span className="text-gray-500"> years</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Industry Experience Required: </span>
                  <EditableField
                    value={data.experienceRequirements?.industryExperience?.required}
                    path="experienceRequirements.industryExperience.required"
                    type="select"
                    options={['true', 'false']}
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Leadership Required: </span>
                  <EditableField
                    value={data.experienceRequirements?.leadershipExperience?.required}
                    path="experienceRequirements.leadershipExperience.required"
                    type="select"
                    options={['true', 'false']}
                  />
                </div>
              </div>
            </div>

            {/* Education Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Education Requirements</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Degree Required: </span>
                  <EditableField
                    value={data.educationRequirements?.degree?.required}
                    path="educationRequirements.degree.required"
                    type="select"
                    options={['true', 'false']}
                  />
                </div>
                {data.educationRequirements?.degree?.level && (
                  <div>
                    <span className="font-medium text-gray-700">Level: </span>
                    <EditableField
                      value={data.educationRequirements.degree.level}
                      path="educationRequirements.degree.level"
                      type="select"
                      options={['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD']}
                    />
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Certifications: </span>
                  <span className="text-gray-600">{data.educationRequirements?.certifications?.length || 0} items</span>
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Responsibilities</h4>
              <ArrayField
                items={data.responsibilities || []}
                path="responsibilities"
                itemName="Responsibility"
                addNewItem={() => ({
                  description: "New responsibility",
                  priority: "PRIMARY",
                  skillsRequired: ["skill"],
                  complexityLevel: "MEDIUM"
                })}
                renderItem={(resp, index) => (
                  <div className="border-l-4 border-green-500 pl-3 space-y-1 pr-8">
                    <div className="text-sm">
                      <EditableField
                        value={resp.description}
                        path={`responsibilities[${index}].description`}
                        placeholder="Responsibility description"
                      />
                    </div>
                    <div className="text-xs text-gray-600 flex flex-wrap items-center gap-1">
                      <span>Priority: </span>
                      <EditableField
                        value={resp.priority}
                        path={`responsibilities[${index}].priority`}
                        type="select"
                        options={['PRIMARY', 'SECONDARY', 'OCCASIONAL']}
                      />
                      <span> • Complexity: </span>
                      <EditableField
                        value={resp.complexityLevel}
                        path={`responsibilities[${index}].complexityLevel`}
                        type="select"
                        options={['LOW', 'MEDIUM', 'HIGH']}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
