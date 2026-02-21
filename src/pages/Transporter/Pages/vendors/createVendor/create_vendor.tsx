'use client'

import { useMutation } from '@apollo/client/react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { GET_ALL_VENDORS } from '../vendorList/VendorList.gql'
import { CREATE_VENDOR } from './create_vendor.gql'
import { Button, FormSection, Input, MultiSelect, Select, Textarea } from './create_vendor.ui'
import { BackButton } from '../../../../../components/common/BackButton'

type CreateVendorProps = {
  onBack: () => void
}

type VendorFormState = {
  vendorName: string
  contactPerson: string
  email: string
  mobile: string
  address: string
  pan: string
  gst: string
  bankDetails: string
  serviceArea: string
  vehicleTypes: string[]
  worksWithTopCompanies: string
  majorIndustry: string
}

export const Create_Vendor = ({ onBack }: CreateVendorProps) => {
  const [form, setForm] = useState<VendorFormState>({
    vendorName: '',
    contactPerson: '',
    email: '',
    mobile: '',
    address: '',
    pan: '',
    gst: '',
    bankDetails: '',
    serviceArea: '',
    vehicleTypes: [],
    worksWithTopCompanies: '',
    majorIndustry: '',
  })

  const [createVendor] = useMutation(CREATE_VENDOR, {
    refetchQueries: [{ query: GET_ALL_VENDORS }],
    onCompleted: () => {
      toast.success('Vendor created successfully')
      onBack()
    },
    onError: (err) => {
      console.error(err)
      toast.error(err.message)
    },
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createVendor({
      variables: {
        input: {
          vendorName: form.vendorName,
          contactPerson: form.contactPerson,
          email: form.email,
          mobile: form.mobile,
          address: form.address || null,
          pan: form.pan || null,
          gst: form.gst || null,
          bankDetails: form.bankDetails || null,
          serviceArea: form.serviceArea || null,
          vehicleTypes: form.vehicleTypes.length > 0 ? form.vehicleTypes : null,
          worksWithTopCompanies: form.worksWithTopCompanies || null,
          majorIndustry: form.majorIndustry || null,
        },
      },
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} title="Back to Vendors" />
        <h2 className="text-xl font-semibold text-gray-800">Create Vendor</h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-8"
      >
        {/* BASIC INFO */}
        <FormSection title="Basic Information">
          <Input
            label="Vendor / Company Name"
            name="vendorName"
            value={form.vendorName}
            onChange={handleChange}
            required
          />

          <Input
            label="Contact Person"
            name="contactPerson"
            value={form.contactPerson}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Mobile Number"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
          />
        </FormSection>

        {/* ADDRESS */}
        <FormSection title="Address">
          <Textarea label="Address" name="address" value={form.address} onChange={handleChange} />
        </FormSection>

        {/* COMPLIANCE */}
        <FormSection title="Compliance Details">
          <Input label="PAN Number" name="pan" value={form.pan} onChange={handleChange} />

          <Input label="GST Number" name="gst" value={form.gst} onChange={handleChange} />
        </FormSection>

        {/* BUSINESS */}
        <FormSection title="Business Information">
          <Input
            label="Bank Details"
            name="bankDetails"
            value={form.bankDetails}
            onChange={handleChange}
          />

          <Input
            label="Service Area"
            name="serviceArea"
            value={form.serviceArea}
            onChange={handleChange}
          />

          {/* NEW FIELD */}
          <Input
            label="Works With Top 3 Companies"
            name="worksWithTopCompanies"
            placeholder="e.g. Amazon, Flipkart, Tata"
            value={form.worksWithTopCompanies}
            onChange={handleChange}
          />

          <Input
            label="Major Industry You Work In"
            name="majorIndustry"
            placeholder="e.g. Logistics, FMCG, E-commerce"
            value={form.majorIndustry}
            onChange={handleChange}
          />

          <MultiSelect
            label="Vehicle Types Supported"
            options={[
              'MINI_TRUCK',
              'SMALL_TRUCK',
              'MEDIUM_TRUCK',
              'LARGE_TRUCK',
              'HEAVY_TRUCK',
              'TRAILER',
              'CONTAINER',
            ]}
            selectedValues={form.vehicleTypes}
            onChange={(values) => setForm((prev) => ({ ...prev, vehicleTypes: values }))}
          />
        </FormSection>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onBack}>
            Cancel
          </Button>

          <Button type="submit" variant="primary">
            Create Vendor
          </Button>
        </div>
      </form>
    </div>
  )
}
