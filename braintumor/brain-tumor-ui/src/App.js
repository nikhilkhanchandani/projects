import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  Input,
} from "@mui/material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)({
  width: "400px",
  margin: "0 auto",
  textAlign: "center",
  padding: "20px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
});

function App() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setPrediction(data.prediction);
      } else {
        setPrediction(data.error || "An error occurred.");
      }
    } catch (error) {
      setPrediction("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <StyledCard>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Brain Tumor Prediction
          </Typography>
          <Input
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: "image/*" }}
          />
          <Box marginY={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={loading}
            >
              Upload and Predict
            </Button>
          </Box>
          {loading && <CircularProgress />}
          {prediction && (
            <Typography variant="h6" color="textSecondary">
              Prediction: {prediction}
            </Typography>
          )}
        </CardContent>
      </StyledCard>
    </Container>
  );
}

export default App;
