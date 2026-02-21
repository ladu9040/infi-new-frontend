const Agreement = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Vendor Agreement</h1>
            <p className="text-gray-600 text-lg">Terms and Conditions for Vendor Onboarding</p>
            <p className="text-sm text-gray-500 mt-2">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Agreement Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This Vendor Agreement ("Agreement") is entered into between the Company ("We", "Us",
                or "Our") and the Vendor ("You", "Your", or "Vendor") for the purpose of
                establishing a business relationship for the provision of transportation and
                logistics services. By completing the vendor onboarding process and checking the
                agreement checkbox, you acknowledge that you have read, understood, and agree to be
                bound by all terms and conditions set forth in this Agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Vendor:</strong> Any individual, company, or entity providing
                  transportation, logistics, or related services.
                </li>
                <li>
                  <strong>Services:</strong> All transportation, logistics, warehousing, and related
                  services provided by the Vendor.
                </li>
                <li>
                  <strong>Company:</strong> The entity engaging the Vendor for Services.
                </li>
                <li>
                  <strong>Shipment:</strong> Any goods, materials, or products transported by the
                  Vendor.
                </li>
                <li>
                  <strong>Rate:</strong> The agreed-upon compensation for Services rendered.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Vendor Obligations</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    3.1 Service Standards
                  </h3>
                  <p className="leading-relaxed">
                    The Vendor agrees to provide Services in a professional, timely, and efficient
                    manner. All Services must comply with applicable laws, regulations, and industry
                    standards. The Vendor shall maintain all necessary licenses, permits, and
                    insurance coverage required for the provision of Services.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    3.2 Vehicle and Equipment
                  </h3>
                  <p className="leading-relaxed">
                    All vehicles and equipment used in providing Services must be in good working
                    condition, properly maintained, and comply with all safety and regulatory
                    requirements. The Vendor is responsible for ensuring that all vehicles are
                    properly insured and meet the Company's quality standards.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    3.3 Documentation and Reporting
                  </h3>
                  <p className="leading-relaxed">
                    The Vendor agrees to maintain accurate records of all Services provided,
                    including but not limited to delivery receipts, waybills, and proof of delivery.
                    All documentation must be submitted to the Company in a timely manner as
                    specified in individual service agreements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3.4 Compliance</h3>
                  <p className="leading-relaxed">
                    The Vendor shall comply with all applicable local, state, and federal laws,
                    including but not limited to transportation regulations, labor laws, tax
                    obligations, and environmental regulations. The Vendor must maintain valid GST
                    registration, PAN, and other required business licenses.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Company Obligations</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 Payment Terms</h3>
                  <p className="leading-relaxed">
                    The Company agrees to pay the Vendor according to the agreed-upon rates and
                    payment terms. Payments will be made within the timeframe specified in
                    individual service agreements, typically within 30-45 days of invoice
                    submission, subject to verification of Services rendered.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    4.2 Service Assignments
                  </h3>
                  <p className="leading-relaxed">
                    The Company will provide clear instructions, delivery schedules, and necessary
                    information for each service assignment. The Company reserves the right to
                    modify or cancel assignments with reasonable notice, subject to applicable
                    cancellation policies.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    4.3 Support and Communication
                  </h3>
                  <p className="leading-relaxed">
                    The Company will provide necessary support, training, and communication channels
                    to facilitate efficient service delivery. The Company will maintain open lines
                    of communication for addressing queries, concerns, and operational issues.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Rates and Payment</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  Rates for Services shall be as agreed upon between the Company and Vendor, either
                  through the rate master system or individual service agreements. Rates may be
                  subject to periodic review and adjustment with mutual consent. All rates are
                  exclusive of applicable taxes, which will be charged separately.
                </p>
                <p className="leading-relaxed">
                  Invoices must be submitted with all required documentation, including proof of
                  delivery, waybills, and any other supporting documents. The Company reserves the
                  right to withhold payment or deduct amounts for non-compliance, damages, or
                  service deficiencies.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Insurance and Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  The Vendor is required to maintain comprehensive insurance coverage, including but
                  not limited to vehicle insurance, cargo insurance, and third-party liability
                  insurance. The minimum coverage amounts will be specified by the Company and must
                  be maintained throughout the term of this Agreement.
                </p>
                <p className="leading-relaxed">
                  The Vendor shall be liable for any loss, damage, or delay to shipments caused by
                  the Vendor's negligence, misconduct, or failure to comply with this Agreement. The
                  Vendor agrees to indemnify and hold harmless the Company from any claims, damages,
                  or losses arising from the Vendor's actions or omissions.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Confidentiality</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Vendor agrees to maintain strict confidentiality regarding all business
                information, customer data, pricing, and proprietary information disclosed by the
                Company. This obligation shall continue even after the termination of this
                Agreement. The Vendor shall not disclose, use, or permit the use of any confidential
                information for any purpose other than the performance of Services under this
                Agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Term and Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  This Agreement shall commence upon the Vendor's successful onboarding and
                  acceptance by the Company. The Agreement may be terminated by either party with 30
                  days written notice, or immediately in case of material breach, non-compliance, or
                  violation of terms.
                </p>
                <p className="leading-relaxed">
                  The Company reserves the right to suspend or terminate the Vendor's access to the
                  platform and services in case of non-compliance, fraudulent activities, or any
                  behavior that may harm the Company's reputation or business interests.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from or relating to this Agreement shall first be addressed
                through good faith negotiations between the parties. If such negotiations fail,
                disputes shall be resolved through arbitration in accordance with the Arbitration
                and Conciliation Act, or through the appropriate courts having jurisdiction over the
                matter.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. General Provisions</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    10.1 Independent Contractor
                  </h3>
                  <p className="leading-relaxed">
                    The Vendor is an independent contractor and not an employee, agent, or partner
                    of the Company. The Vendor has no authority to bind the Company in any manner
                    and shall not represent itself as an employee or agent of the Company.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">10.2 Modifications</h3>
                  <p className="leading-relaxed">
                    This Agreement may only be modified by written agreement signed by both parties.
                    The Company reserves the right to update terms and conditions with reasonable
                    notice, and continued use of services constitutes acceptance of modified terms.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">10.3 Force Majeure</h3>
                  <p className="leading-relaxed">
                    Neither party shall be liable for delays or failures in performance resulting
                    from acts beyond their reasonable control, including but not limited to natural
                    disasters, war, strikes, government actions, or pandemics.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">10.4 Governing Law</h3>
                  <p className="leading-relaxed">
                    This Agreement shall be governed by and construed in accordance with the laws of
                    India. Any legal proceedings shall be subject to the exclusive jurisdiction of
                    the courts in the jurisdiction where the Company's principal office is located.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Acceptance</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By checking the agreement checkbox during the vendor onboarding process, you
                acknowledge that you have read this Agreement in its entirety, understand all terms
                and conditions, and agree to be bound by them. You represent that you have the
                authority to enter into this Agreement on behalf of the Vendor entity.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to any of the terms and conditions set forth in this Agreement,
                you must not proceed with the vendor onboarding process. Your use of the platform
                and services constitutes your acceptance of this Agreement.
              </p>
            </section>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <p className="text-center text-gray-600 text-sm">
                For any questions or clarifications regarding this Agreement, please contact our
                support team or legal department.
              </p>
              <p className="text-center text-gray-500 text-xs mt-4">
                © {new Date().getFullYear()} All rights reserved. This Agreement is a legal
                document. Please read it carefully.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Agreement
