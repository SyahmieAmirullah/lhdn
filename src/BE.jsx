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
} from "reactstrap";
import axios from "axios";
import SideBar from "./UserSideBar";

const BE = () => {
  const [formData, setFormData] = useState({
    name: "",
    ic: "",
    address: "",
    occupation: "",
    employerName: "",
    employmentIncome: "",
    otherIncome: "",
    epfContribution: "",
    lifeInsurance: "",
    zakat: "",
    taxPaid: "",
    signedBy: "",
    icSignedBy: "",
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User not authenticated.");
      return;
    }

    // Step 1: Get local profile data
    axios
      .get(`http://localhost:3000/api/profile/${userId}`)
      .then((res) => {
        const user = res.data;
        setFormData((prev) => ({
          ...prev,
          ic: user.user_id || userId,
          signedBy: user.fullname || "",
          icSignedBy: user.user_id || userId,
        }));
      })
      .catch((err) => {
        console.error("Failed to fetch local profile", err);
        alert("Failed to fetch user profile");
      });

    // Step 2: Fetch from MyJPN API using IC
    fetch("https://myjpn.ddns.net:5443/LHDNApi/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icno: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setFormData((prev) => ({
            ...prev,
            name: data.user.fullname || "",
            address: data.user.address || "",
          }));
        } else {
          console.warn("MyJPN data not found");
        }
      })
      .catch((err) => {
        console.error("MyJPN API error", err);
      });

    // ✅ Step 3: Fetch occupation & employment income
    axios
      .get(`http://localhost:3003/api/occupation/${userId}`)
      .then((res) => {
        const data = res.data;
        setFormData((prev) => ({
          ...prev,
          occupation: data.OCCUPATION || "",
          employmentIncome: parseFloat(data.INCOME) || 0,
        }));
      })
      .catch((err) => {
        console.error("Failed to fetch occupation data", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["otherIncome", "taxPaid", "zakat"];

    if (numericFields.includes(name)) {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTaxDue = (taxableIncome, zakatAmount = 0) => {
    let tax = 0;

    if (taxableIncome <= 5000) {
      tax = 0;
    } else if (taxableIncome <= 20000) {
      tax = (taxableIncome - 5000) * 0.01;
    } else if (taxableIncome <= 35000) {
      tax = 15000 * 0.01 + (taxableIncome - 20000) * 0.03;
    } else if (taxableIncome <= 50000) {
      tax = 15000 * 0.01 + 15000 * 0.03 + (taxableIncome - 35000) * 0.08;
    } else {
      tax =
        15000 * 0.01 +
        15000 * 0.03 +
        15000 * 0.08 +
        (taxableIncome - 50000) * 0.13;
    }

    return parseFloat(Math.max(0, tax - zakatAmount).toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const employmentIncome = parseFloat(formData.employmentIncome) || 0;
    const otherIncome = parseFloat(formData.otherIncome) || 0;
    const zakat = parseFloat(formData.zakat) || 0;
    const totalIncome = employmentIncome + otherIncome;
    const taxableIncome = totalIncome;
    const taxDue = calculateTaxDue(taxableIncome, zakat);

    const submissionData = {
      userId: formData.ic,
      taxYear: new Date().getFullYear(),
      submitDate: formData.date,
      totalIncome,
      taxableIncome,
      taxDue,
      submitStatus: "SUBMITTED",
    };

    try {
      await axios.post("http://localhost:3000/api/submit-tax", submissionData);

      if (otherIncome > 0) {
        await axios.post("http://localhost:3000/api/income", {
          userId: formData.ic,
          amount: otherIncome,
          incomeType: "Other Income",
        });
      }

      alert(`Borang e-BE berjaya dihantar! Jumlah cukai: RM ${taxDue}`);
    } catch (error) {
      console.error("Error submitting tax form:", error);
      alert("Ralat semasa menghantar borang.");
    }
  };

  const employmentIncome = parseFloat(formData.employmentIncome) || 0;
  const otherIncome = parseFloat(formData.otherIncome) || 0;
  const zakat = parseFloat(formData.zakat) || 0;
  const totalIncome = employmentIncome + otherIncome;
  const estimatedTax = calculateTaxDue(totalIncome, zakat);

  return (
    <>
      <SideBar />
      <Container style={{ marginTop: "100px", marginBottom: "50px" }}>
        <Card>
          <CardBody>
            <h3 className="text-center mb-4">
              Borang e-BE (Individu Pendapatan Bukan Perniagaan)
            </h3>
            <Form onSubmit={handleSubmit}>
              {/* A. Maklumat Peribadi */}
              <h5 className="mt-3">A. Maklumat Peribadi</h5>
              <FormGroup>
                <Label>Nama</Label>
                <Input type="text" name="name" value={formData.name} disabled />
              </FormGroup>
              <FormGroup>
                <Label>No. Kad Pengenalan</Label>
                <Input type="text" name="ic" value={formData.ic} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Alamat</Label>
                <Input
                  type="textarea"
                  name="address"
                  value={formData.address || ""}
                  rows="3"
                  style={{ resize: "none", overflow: "hidden" }}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Pekerjaan</Label>
                <Input
                  type="text"
                  name="occupation"
                  value={formData.occupation || ""}
                  disabled
                />
              </FormGroup>

              <h5 className="mt-4">B. Pendapatan</h5>
              <FormGroup>
                <Label>Pendapatan Penggajian</Label>
                <Input
                  type="text"
                  name="employmentIncome"
                  value={formData.employmentIncome || ""}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Pendapatan Lain</Label>
                <Input
                  type="number"
                  name="otherIncome"
                  min="0"
                  value={formData.otherIncome || ""}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                />
              </FormGroup>
              <FormGroup>
                <Label>Jumlah Anggaran Cukai Perlu Dibayar</Label>
                <Input type="text" value={`RM ${estimatedTax}`} disabled />
              </FormGroup>

              <h5 className="mt-4">C. Maklumat Cukai</h5>
              <FormGroup>
                <Label>Zakat</Label>
                <Input
                  type="number"
                  name="zakat"
                  min="0"
                  value={formData.zakat || ""}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                />
              </FormGroup>
              <FormGroup>
                <Label>Jumlah Cukai Telah Dibayar</Label>
                <Input
                  type="number"
                  name="taxPaid"
                  min="0"
                  value={formData.taxPaid || ""}
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                />
              </FormGroup>

              {/* D. Pengakuan */}
              <h5 className="mt-4">D. Pengakuan</h5>
              <FormGroup>
                <Label>Ditandatangani Oleh</Label>
                <Input
                  type="text"
                  name="signedBy"
                  value={formData.signedBy || ""}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>No. Kad Pengenalan Penandatangan</Label>
                <Input
                  type="text"
                  name="icSignedBy"
                  value={formData.icSignedBy || ""}
                  onChange={handleChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Tarikh</Label>
                <Input type="date" name="date" value={formData.date} readOnly />
              </FormGroup>

              <Button type="submit" color="success" block>
                Hantar e-BE
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

export default BE;
