import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Card,
  CardBody,
  Row,
  Col,
  Spinner,
  Alert,
} from "reactstrap";
import UserSideBar from "./UserSideBar";

const TaxInfo = () => {
  const [taxData, setTaxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to get user ID from sessionStorage
  const getUserFromSession = () => {
    return sessionStorage.getItem("userId");
  };

  // Fetch tax data when component mounts
  useEffect(() => {
    const userId = getUserFromSession();

    if (!userId) {
      setError("User not found in session. Please log in again.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:3000/api/tax/${userId}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setTaxData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load tax data.Please do BE declaration first.");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <UserSideBar />
      <Container className="mt-5 pt-5">
        <h2 className="text-center mb-4">Tax Submission Information</h2>

        {/* Show spinner while loading */}
        {loading ? (
          <div className="text-center">
            <Spinner color="primary" />
          </div>
        ) : error ? (
          // Show error message if there's any error
          <Alert color="danger">{error}</Alert>
        ) : taxData.length === 0 ? (
          // Show warning if no data is found
          <Alert color="warning">No tax records found.</Alert>
        ) : (
          // Display tax records if data is available
          taxData.map((record, index) => {
            const {
              SUBMIT_ID,
              USER_ID,
              TAX_YEAR,
              SUBMIT_DATE,
              TOTAL_INCOME,
              TAXABLE_INCOME,
              TAX_DUE,
              SUBMIT_STATUS,
            } = record;

            return (
              <Row className="justify-content-center mb-4" key={index}>
                <Col md="8">
                  <Card className="shadow-sm">
                    <CardBody>
                      {/* Display the tax data in a structured format */}
                      {[
                        { label: "Submit ID", value: SUBMIT_ID },
                        { label: "User ID", value: USER_ID },
                        { label: "Tax Year", value: TAX_YEAR },
                        {
                          label: "Submit Date",
                          value: SUBMIT_DATE?.split("T")[0],
                        },
                        {
                          label: "Total Income",
                          value: `RM ${parseFloat(
                            TOTAL_INCOME
                          ).toLocaleString()}`,
                        },
                        {
                          label: "Taxable Income",
                          value: `RM ${parseFloat(
                            TAXABLE_INCOME
                          ).toLocaleString()}`,
                        },
                        {
                          label: "Tax Due",
                          value: `RM ${parseFloat(
                            TAX_DUE
                          ).toLocaleString()}`,
                        },
                        { label: "Submit Status", value: SUBMIT_STATUS || "N/A" },
                      ].map(({ label, value }, idx) => (
                        <Row className="mb-2" key={idx}>
                          <Col md="4">
                            <strong>{label}:</strong>
                          </Col>
                          <Col md="8">{value || "N/A"}</Col>
                        </Row>
                      ))}
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            );
          })
        )}
      </Container>
    </>
  );
};

export default TaxInfo;
