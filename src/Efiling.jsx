import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Card,
  CardBody,
  Table,
} from "reactstrap";
import Sidebar from "./UserSideBar";
import axios from "axios";
import Tesseract from "tesseract.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Efiling = () => {
  const [formData, setFormData] = useState({
    serialNumber: "",
    name: "",
    identificationNo: "",
    totalIncome: 0,
    taxableIncome: 0,
    taxAmount: 0,
    signedBy: "",
    signerIdentification: "",
    timestamp: "",
    submitId: "",
  });

  const [deductions, setDeductions] = useState([]);
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [originalTaxAmount, setOriginalTaxAmount] = useState(0);
  const [finalTaxAmount, setFinalTaxAmount] = useState(0);

  const generateSerialNumber = () => "SIR" + Date.now();

  useEffect(() => {
    const now = new Date();
    const serial = generateSerialNumber();
    const timestamp = now.toISOString().slice(0, 16);
    const userId = sessionStorage.getItem("userId");

    setFormData((prev) => ({
      ...prev,
      serialNumber: serial,
      timestamp,
    }));

    if (userId) {
      // Get user profile (e.g., full name)
      axios.post("https://myjpn.ddns.net:5443/LHDNApi/profile", { icno: userId }).then((res) => {
        const user = res.data?.user || {};
        setFormData((prev) => ({
          ...prev,
          name: user.fullname || "",
          identificationNo: userId,
          signedBy: user.fullname || "",
          signerIdentification: userId,
        }));
      });

      // Get tax data
      axios.get(`http://localhost:3000/api/tax/${userId}`).then((res) => {
        const tax = res.data;
        setFormData((prev) => ({
          ...prev,
          totalIncome: tax.TOTAL_INCOME ?? 0,
          taxableIncome: tax.TAXABLE_INCOME ?? 0,
          taxAmount: tax.TAX_DUE ?? 0,
          submitId: tax.SUBMIT_ID ?? "",
        }));
        setOriginalTaxAmount(Number(tax.TAX_DUE ?? 0));
        setFinalTaxAmount(Number(tax.TAX_DUE ?? 0));
      });
    }
  }, []);

  useEffect(() => {
    const deductionTotal = deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const newTax = Math.max(originalTaxAmount - deductionTotal, 0);
    setTotalDeduction(deductionTotal);
    setFinalTaxAmount(newTax);
    setFormData((prev) => ({
      ...prev,
      taxAmount: newTax,
    }));
  }, [deductions]);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const extractAmountFromText = (text) => {
    const lines = text.split("\n").map((line) => line.trim());
    for (let line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes("jumlah") || lower.includes("total")) {
        const match = line.match(/(RM)?\s?(\d{1,3}(,\d{3})*(\.\d{2})?|\d+(\.\d{2})?)/gi);
        if (match) {
          const amounts = match
            .map((m) => parseFloat(m.replace(/[^\d.]/g, "")))
            .filter((v) => !isNaN(v));
          if (amounts.length > 0) {
            return Math.max(...amounts);
          }
        }
      }
    }
    const allMatches = text.match(/(RM)?\s?(\d{1,3}(,\d{3})*(\.\d{2})?|\d+(\.\d{2})?)/gi);
    if (allMatches) {
      const values = allMatches
        .map((m) => parseFloat(m.replace(/[^\d.]/g, "")))
        .filter((v) => !isNaN(v));
      return values.length ? Math.max(...values) : 0;
    }
    return 0;
  };

  const extractLabelFromText = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes("zakat")) return "Zakat";
    if (lower.includes("socso")) return "SOCSO";
    if (lower.includes("kwsp")) return "KWSP";
    if (lower.includes("tabung haji")) return "Tabung Haji";
    if (lower.includes("pendidikan")) return "Pendidikan";
    if (lower.includes("derma") || lower.includes("donation")) return "Donation";
    if (lower.includes("jumlah") || lower.includes("total")) return "Jumlah";
    return "Deduction";
  };

  const handleOCR = async () => {
    setIsProcessing(true);
    const results = [];

    for (const file of images) {
      const imageText = await Tesseract.recognize(file, "eng", {
        logger: (m) => console.log(m),
      });

      const text = imageText.data.text;
      const amount = extractAmountFromText(text);
      const label = extractLabelFromText(text);

      results.push({ label, amount });
    }

    setDeductions(results);
    setIsProcessing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = sessionStorage.getItem("userId");

    const formDataToSend = {
      submitId: formData.submitId,
      userId,
      totalIncome: formData.totalIncome,
      taxableIncome: formData.taxableIncome,
      taxAmount: finalTaxAmount,
      deductions,
      totalDeduction,
      finalTaxAmount,
    };

    try {
      const response = await axios.post("http://localhost:3000/api/deduct", formDataToSend);
      toast.success("Borang dihantar dengan jayanya!");
      console.log(response.data);
    } catch (error) {
      toast.error("Ralat semasa menghantar borang.");
      console.error("Error submitting form", error);
    }
  };

  return (
    <>
      <Sidebar />
      <Container style={{ marginTop: "100px", marginBottom: "40px" }}>
        <Card>
          <CardBody>
            <h3 className="text-center mb-4">e-Filing Form</h3>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nombor Siri</Label>
                <Input type="text" value={formData.serialNumber} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Nama</Label>
                <Input type="text" value={formData.name} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Submit ID</Label>
                <Input
                  type="text"
                  name="submitId"
                  value={formData.submitId}
                  onChange={(e) => setFormData({ ...formData, submitId: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Kad Pengenalan</Label>
                <Input type="text" value={formData.identificationNo} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Jumlah Pendapatan</Label>
                <Input type="number" value={formData.totalIncome} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Pendapatan Bercukai</Label>
                <Input type="number" value={formData.taxableIncome} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Jumlah Cukai Yang Dikenakan</Label>
                <Input type="number" value={formData.taxAmount} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Pengakuan Dan Ditandatangani Oleh</Label>
                <Input type="text" value={formData.signedBy} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>No. Pengenalan</Label>
                <Input type="text" value={formData.signerIdentification} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Tarikh Dan Masa</Label>
                <Input type="datetime-local" value={formData.timestamp} readOnly />
              </FormGroup>

              <FormGroup>
                <Label>Upload Resit Potongan (OCR)</Label>
                <Input type="file" multiple onChange={handleImageChange} accept="image/*" />
                <Button color="secondary" className="mt-2" onClick={handleOCR} disabled={isProcessing}>
                  {isProcessing ? "Memproses..." : "Proses OCR"}
                </Button>
              </FormGroup>

              {deductions.length > 0 && (
                <>
                  <h5 className="mt-4">Senarai Potongan</h5>
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>Jenis Potongan</th>
                        <th>Jumlah (RM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deductions.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.label}</td>
                          <td>{Number(item.amount || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <h6 className="mt-3">
                    Jumlah Pelepasan Cukai: <strong>RM {totalDeduction.toFixed(2)}</strong>
                  </h6>
                </>
              )}

              <Button color="primary" type="submit" block>
                Submit e-Filing
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Container>
      <ToastContainer />
    </>
  );
};

export default Efiling;
