# Base44 Tax Calculator - User Manual

Welcome to the **Base44 Tax Calculator**, a comprehensive tool designed to simplify Philippine tax computations for Estates, Sales, and Donations. This manual will guide you through the features and modules of the application to ensure accurate and efficient tax processing.

---

## Table of Contents
1. [Getting Started](#1-getting-started)
2. [Estate Tax Module](#2-estate-tax-module)
3. [Sale & Donation Module](#3-sale--donation-module)
4. [Adding and Valuating Properties](#4-adding-and-valuating-properties)
5. [Interactive Financial Solvers (Securities)](#5-interactive-financial-solvers-securities)
6. [Generating BIR Forms](#6-generating-bir-forms)
7. [Troubleshooting & FAQs](#7-troubleshooting--faqs)

---

## 1. Getting Started

When you launch the application, you will be presented with a clean, modern interface featuring a main navigation tab at the top. You can easily switch between the two primary tax scenarios:
- **Estate Tax**
- **Sale / Donation Tax**

The application automatically recalculates the tax due and updates the results panel whenever you modify any input fields.

---

## 2. Estate Tax Module

The Estate Tax module is designed to compute the tax liabilities left by a deceased person, deducting the standard exemptions to find the net taxable estate.

### Steps to Compute Estate Tax:
1. **Navigate to the Estate Tax Tab.**
2. **Deceased Information:** Fill in the basic details of the deceased (Name, Date of Death, TIN, Address). This information is required to properly populate the generated BIR forms.
3. **Add Properties (Gross Estate):** Click the **"Add Property"** button to include assets owned by the deceased. You can add multiple properties and select their types (e.g., Land, Building, Stocks, Vehicles, Securities).
4. **View Results:** The right-hand (or bottom) panel will display a real-time breakdown of the Gross Estate, Standard Deductions (e.g., ₱5,000,000 standard deduction under TRAIN law), Net Taxable Estate, and the Final Estate Tax Due (6%).
5. **Export:** Click **"Generate BIR Form 1801"** to download or print the official tax return format.

---

## 3. Sale & Donation Module

This module handles the transfer of properties either through a commercial sale or a gratuitous donation. 

### Steps to Compute Sale/Donation Taxes:
1. **Navigate to the Sale / Donation Tab.**
2. **Select Transaction Mode:** Toggle between **Sale** and **Donation** at the top of the form. The UI and tax rates will adapt automatically.
3. **Party Information:**
   - **For Sale:** Enter the Seller and Buyer details.
   - **For Donation:** Enter the Donor and Donee details.
4. **Select Property Category:** Choose whether you are transferring **Real Property** (Land/Building) or **Personal Property** (Stocks, Vehicles, Securities).
5. **Enter Property Details:** Input the required financial values (e.g., Selling Price, Zonal Value, Acquisition Cost, Fair Market Value).
6. **View Results:** 
   - **Sale:** Computes Capital Gains Tax (CGT) at 15% (for stocks/securities) or 6% (for real properties), plus Documentary Stamp Tax (DST).
   - **Donation:** Computes Donor's Tax at 6% (in excess of the ₱250,000 annual exemption) plus DST.
7. **Export:** Click the generation button to create **BIR Form 1706 (Sale)** or **BIR Form 1800 (Donation)**.

---

## 4. Adding and Valuating Properties

Depending on the property type selected, the calculator will ask for specific inputs:

- **Real Properties (Land / Building):** Requires inputs for Selling Price/Fair Market Value, Zonal Value, and Assessed Value. The system automatically uses the *highest* of these values as the taxable base.
- **Stocks:** Requires inputs for the number of shares, Book Value per Share, and Par Value. Distinguishes between Listed and Non-Listed shares.
- **Vehicles:** Requires Brand, Model, Plate Number, and the Fair Market Value of the vehicle.
- **Securities:** Requires Quantity, Unit Value, and any Accrued Interest. Used for Equity, Debt (Bonds), and Derivative securities.

---

## 5. Interactive Financial Solvers (Securities)

For users who need to compute the exact unit value of complex financial securities, the **Securities** property form includes built-in interactive financial solvers. 

To use them:
1. Scroll down to the **"🧮 Interactive Financial Solvers / Calculators"** section in a Securities form.
2. Click on a specific solver to expand it:
   - **Gordon Stock Model (Equity):** Calculates stock price based on Next Dividend, Required Return, and Growth Rate.
   - **Bond Valuation:** Computes the present value of a bond based on Face Value, Coupon Rate, Market Rate, and Years to Maturity.
   - **TVM (PV) Solver:** A standard Time Value of Money calculator to find the Present Value of a future sum.
   - **Yield & Return Solver:** Computes Current Yield, Yield to Maturity (YTM), and Holding Period Return based on purchase prices and income.
3. Enter the variables for the formula. The tool provides a step-by-step mathematical breakdown.
4. Click **"Apply to Security Unit Value"** to automatically transfer the computed result to the main tax form.

---

## 6. Generating BIR Forms

Once your computations are complete and accurate:
1. Locate the **Export / Print** section at the bottom of the Results Panel.
2. Click the corresponding button (e.g., **"Generate BIR Form 1801"**).
3. **What Happens Next?**
   - The application will attempt to automatically download a formatted HTML file of the BIR form to your device.
   - Simultaneously, it will try to seamlessly open your browser's native Print/Save as PDF dialog via a secure iframe.
4. You can save the output as a PDF or print it directly.

---

## 7. Troubleshooting & FAQs

**Q: The PDF/Print dialog isn't opening.**
> A: Check your browser's pop-up blocker settings. If the automated print dialog is blocked, you can simply open the downloaded `.html` file from your device's Downloads folder and press `Ctrl+P` (or `Cmd+P` on Mac) to print it to PDF.

**Q: My Net Capital Gain is showing as negative, but the system shows taxes.**
> A: Capital Gains Tax (CGT) is generally calculated on the presumed gain (especially for real properties, which is 6% of the gross selling price or fair market value, whichever is higher, regardless of actual loss). For stocks/securities, if there is a net capital loss, CGT is ₱0, but Documentary Stamp Tax (DST) still applies to the transaction.

**Q: How do I remove a property from the Estate tax list?**
> A: Click the red trash can (🗑️) icon located at the top right of the specific property card you wish to delete.

**Q: Why is the Donor's Tax showing ₱0?**
> A: Philippine tax law provides an annual exemption of ₱250,000 for donations. If the total Net Taxable Gift is ₱250,000 or below, the Donor's Tax due is zero.

**Q: Are my financial inputs saved?**
> A: Currently, all computations are processed locally in your browser for maximum privacy and security. If you refresh the page, your inputs will reset. Please ensure you generate and save your BIR forms before exiting.
