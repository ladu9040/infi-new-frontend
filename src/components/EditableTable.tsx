import { Pencil, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'

export interface Column {
  key: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select'
  options?: string[]
  editable?: boolean
}

export type BaseRow = { id?: string } & Record<string, any>

interface EditableTableProps<T extends BaseRow> {
  columns: Column[]
  data: T[]
  onSave: (data: T) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export const EditableTable = <T extends BaseRow>({
  columns,
  data,
  onSave,
  onDelete,
}: EditableTableProps<T>) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<T>({} as T)

  // const [isAdding, setIsAdding] = useState(true)
  const [addForm, setAddForm] = useState<T>({} as T)

  const handleEditClick = (row: T) => {
    setEditingId(String(row.id))
    setEditForm({ ...row })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({} as T)
  }

  const handleSaveEdit = async () => {
    await onSave(editForm)
    setEditingId(null)
    setEditForm({} as T)
  }

  // const handleAddClick = () => {
  //   setIsAdding(true)
  //   setAddForm({} as T)
  // }

  // const handleCancelAdd = () => {
  //   setIsAdding(false)
  //   setAddForm({} as T)
  // }

  const handleSaveAdd = async () => {
    onSave(addForm).then(() => {
      setAddForm({} as T)
    })
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string,
    isAdd: boolean,
  ) => {
    let value: any = e.target.value

    const col = columns.find((c) => c.key === field)

    if (col?.type === 'date') {
      value = value ? new Date(value).getTime() : null
    } else if (e.target.type === 'number') {
      value = Number(value)
    }

    if (isAdd) {
      setAddForm({ ...addForm, [field]: value })
    } else {
      setEditForm({ ...editForm, [field]: value })
    }
  }

  // ---------- RENDER ----------
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Records</h3>

        {/* <button
          // onClick={handleAddClick}
          disabled={isAdding || !!editingId}
          className="flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New
        </button> */}
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {/* ---------- ADD ROW ---------- */}
            <tr className="bg-blue-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                  {col.editable === false ? (
                    <span className="text-gray-400 italic">Auto-generated</span>
                  ) : col.type === 'select' ? (
                    <select
                      value={addForm[col.key] || ''}
                      onChange={(e) => handleChange(e, col.key, true)}
                      className="block w-full rounded-md border-gray-300 shadow-sm p-1"
                    >
                      <option value="">Select</option>
                      {col.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={col.type || 'text'}
                      value={addForm[col.key] || ''}
                      onChange={(e) => handleChange(e, col.key, true)}
                      className="block w-full rounded-md border-gray-300 shadow-sm p-1"
                    />
                  )}
                </td>
              ))}

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={handleSaveAdd}
                  className="text-green-600 hover:text-green-900 mr-3 cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                </button>
                {/* <button onClick={handleCancelAdd} className="text-red-600 hover:text-red-900">
                    <X className="w-5 h-5" />
                  </button> */}
              </td>
            </tr>

            {/* ---------- EXISTING ROWS ---------- */}
            {data.map((row) => (
              <tr key={String(row.id)}>
                {editingId === row.id ? (
                  <>
                    {/* Editing */}
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                        {col.editable === false ? (
                          <span className="text-gray-500">{row[col.key]}</span>
                        ) : col.type === 'select' ? (
                          <select
                            value={editForm[col.key] || ''}
                            onChange={(e) => handleChange(e, col.key, false)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-1"
                          >
                            {col.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type || 'text'}
                            value={
                              col.type === 'date'
                                ? (() => {
                                    const v = editForm[col.key]
                                    if (!v) return ''
                                    const dt = new Date(Number(v))
                                    return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0]
                                  })()
                                : editForm[col.key] || ''
                            }
                            onChange={(e) => handleChange(e, col.key, false)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-1"
                          />
                        )}
                      </td>
                    ))}

                    {/* Save / Cancel */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-900 mr-3 cursor-pointer"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    {/* Normal display */}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      >
                        {col.type === 'date'
                          ? new Date(Number(row[col.key])).toLocaleDateString()
                          : String(row[col.key] ?? '')}
                      </td>
                    ))}

                    {/* Edit / Delete */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleEditClick(row)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      {onDelete && (
                        <button
                          onClick={() => onDelete(String(row.id))}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
