import { ChevronLeft, ChevronRight, Edit2, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ConfirmationModal } from './ConfirmationModal'

export interface Column<T> {
  key: keyof T
  header: string
  render?: (item: T) => React.ReactNode
  editable?: boolean
  type?: 'text' | 'number' | 'select' | 'date'
  options?: { label: string; value: string }[]
}

interface TableProps<T extends { id?: string | number }> {
  refetch?: () => void
  data: T[]
  columns: Column<T>[]
  onSave?: (item: T) => Promise<void>
  onDelete?: (item: T) => Promise<void>
  onAdd?: (item: Partial<T>) => Promise<void>
  onAddFieldChange?: (key: keyof T, value: string) => void
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  customRenderers?: {
    [key: string]: (props: {
      item: T
      isEditing: boolean
      value: any
      onChange: (value: any) => void
      onKeyDown: (e: React.KeyboardEvent) => void
      isAddMode?: boolean
    }) => React.ReactNode
  }
  externalAddForm?: Partial<T>
  onExternalAddFormChange?: (form: Partial<T>) => void
  externalEditForm?: Partial<T>
  onExternalEditFormChange?: (form: Partial<T>) => void
  externalEditingId?: string | number | null
  onExternalEditingIdChange?: (id: string | number | null) => void
}

export function Table<T extends { id: string | number }>({
  onAddFieldChange,
  data,
  columns,
  onSave,
  onDelete,
  onAdd,
  isLoading,
  pagination,
  customRenderers,
  externalAddForm,
  onExternalAddFormChange,
  externalEditForm,
  onExternalEditFormChange,
  externalEditingId,
  onExternalEditingIdChange,
}: TableProps<T>) {
  const [isAdding, setIsAdding] = useState(false)
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null)
  const [internalAddForm, setInternalAddForm] = useState<Partial<T>>({})
  const [internalEditForm, setInternalEditForm] = useState<Partial<T>>({})
  const [internalEditingId, setInternalEditingId] = useState<string | number | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    item: T | null
  }>({ isOpen: false, item: null })

  const addForm = externalAddForm !== undefined ? externalAddForm : internalAddForm
  const setAddForm = onExternalAddFormChange || setInternalAddForm
  const editForm = externalEditForm !== undefined ? externalEditForm : internalEditForm
  const setEditForm = onExternalEditFormChange || setInternalEditForm
  const editingId = externalEditingId !== undefined ? externalEditingId : internalEditingId
  const setEditingId = onExternalEditingIdChange || setInternalEditingId

  useEffect(() => {
    if (editingId && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [editingId])

  useEffect(() => {
    if (isAdding && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [isAdding])

  const handleEdit = (item: T) => {
    setEditingId(item.id)
    setEditForm(item)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
    setIsAdding(false)
    if (externalAddForm !== undefined && onExternalAddFormChange) {
      onExternalAddFormChange({})
    } else {
      setInternalAddForm({})
    }
  }

  const handleSave = async () => {
    if (onSave && editingId) {
      await onSave(editForm as T)
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleAdd = async () => {
    if (onAdd) {
      await onAdd(addForm)
      setIsAdding(false)
      // Clear the add form
      if (externalAddForm !== undefined && onExternalAddFormChange) {
        onExternalAddFormChange({})
      } else {
        setInternalAddForm({})
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: 'save' | 'add') => {
    if (e.key === 'Enter') {
      if (action === 'save') {
        handleSave()
      } else {
        handleAdd()
      }
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const renderInput = (
    column: Column<T>,
    value: string | number | undefined,
    onChange: (val: string) => void,
    isFirst: boolean,
    action: 'save' | 'add',
    item?: T,
    isAddMode: boolean = false,
  ) => {
    // Check if there's a custom renderer for this column
    const customRenderer = customRenderers?.[String(column.key)]

    if (customRenderer) {
      return customRenderer({
        item: item || ({} as T),
        isEditing: true,
        value,
        onChange: (val) => onChange(String(val)),
        onKeyDown: (e) => handleKeyDown(e, action),
        isAddMode,
      })
    }

    if (column.type === 'select' && column.options) {
      return (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          ref={isFirst ? (firstInputRef as React.RefObject<HTMLSelectElement>) : null}
          onKeyDown={(e) => handleKeyDown(e, action)}
        >
          <option value="">Select...</option>
          {column.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        type={column.type || 'text'}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
        ref={isFirst ? (firstInputRef as React.RefObject<HTMLInputElement>) : null}
        onKeyDown={(e) => handleKeyDown(e, action)}
      />
    )
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              {(onSave || onDelete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add Row */}
            {isAdding && (
              <tr className="bg-blue-50">
                {columns.map((col, idx) => {
                  const customRenderer = customRenderers?.[String(col.key)]

                  return (
                    <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap">
                      {col.editable !== false ? (
                        customRenderer ? (
                          customRenderer({
                            item: {} as T,
                            isEditing: true,
                            value: addForm[col.key],
                            onChange: (val) => {
                              const newForm = { ...addForm, [col.key]: val as T[keyof T] }
                              setAddForm(newForm)
                              onAddFieldChange?.(col.key, String(val))
                            },
                            onKeyDown: (e) => handleKeyDown(e, 'add'),
                            isAddMode: true,
                          })
                        ) : (
                          renderInput(
                            col,
                            addForm[col.key] as string | number | undefined,
                            (val) => {
                              setAddForm({ ...addForm, [col.key]: val as T[keyof T] })
                              onAddFieldChange?.(col.key, val)
                            },
                            idx === 0,
                            'add',
                            {} as T,
                            true,
                          )
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={handleAdd} className="text-green-600 hover:text-green-900 mr-3">
                    <Save className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900">
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}

            {/* Data Rows */}
            {data.map((item) => (
              <tr
                key={item.id}
                className={editingId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
              >
                {columns.map((col, idx) => {
                  const customRenderer = customRenderers?.[String(col.key)]

                  return (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {editingId === item.id && col.editable !== false
                        ? customRenderer
                          ? customRenderer({
                              item,
                              isEditing: true,
                              value: editForm[col.key],
                              onChange: (val) => {
                                setEditForm({ ...editForm, [col.key]: val as T[keyof T] })
                                onAddFieldChange?.(col.key, String(val))
                              },
                              onKeyDown: (e) => handleKeyDown(e, 'save'),
                            })
                          : renderInput(
                              col,
                              editForm[col.key] as string | number | undefined,
                              (val) => {
                                setEditForm({ ...editForm, [col.key]: val as T[keyof T] })
                                onAddFieldChange?.(col.key, String(val))
                              },
                              idx === 0,
                              'save',
                              item,
                            )
                        : customRenderer
                          ? customRenderer({
                              item,
                              isEditing: false,
                              value: item[col.key],
                              onChange: () => {},
                              onKeyDown: () => {},
                            })
                          : col.render
                            ? col.render(item)
                            : String(item[col.key] ?? '')}
                    </td>
                  )
                })}
                {(onSave || onDelete) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        {onSave && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => {
                              setDeleteConfirmation({ isOpen: true, item })
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {!isLoading && data.length === 0 && !isAdding && (
              <tr>
                <td
                  colSpan={columns.length + (onSave || onDelete ? 1 : 0)}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => pagination?.onPageChange(pagination.currentPage - 1)}
            disabled={pagination?.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => pagination?.onPageChange(pagination.currentPage + 1)}
            disabled={pagination?.currentPage === pagination?.totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            {onAdd && !isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </button>
            )}
          </div>

          {pagination && (
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {onDelete && (
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, item: null })}
          onConfirm={() => {
            if (deleteConfirmation.item) {
              onDelete(deleteConfirmation.item)
            }
          }}
          title="Delete Item"
          message="Are you sure you want to delete this item? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </div>
  )
}
