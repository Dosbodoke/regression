from fastapi import FastAPI, UploadFile, File, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader, APIKey
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import io
import os

# Load environment variables from .env file
load_dotenv()

API_KEY = os.getenv("API_KEY")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN")
api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

app = FastAPI()
origins = [
    "http://localhost",
    "http://localhost:3200",
    "https://regression-mu.vercel.app/",
    ALLOWED_ORIGIN
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    else:
        raise HTTPException(
            status_code=403,
            detail="Could not validate credentials",
        )


def calculate_harmonic_components(precipitation_data):
    # Converting the data into a numpy array
    data = np.array(precipitation_data)

    # Number of data points (months)
    N = len(data)

    # Perform the Fourier transform
    fft_result = np.fft.fft(data)

    # Frequencies
    frequencies = np.fft.fftfreq(N)

    # Amplitudes and phases
    amplitudes = np.abs(fft_result)
    phases = np.angle(fft_result)

    # Only the first half of the frequencies are needed (positive frequencies)
    half_N = N // 2
    frequencies = frequencies[:half_N]
    amplitudes = amplitudes[:half_N]
    phases = phases[:half_N]

    return frequencies.tolist(), amplitudes.tolist(), phases.tolist()


@app.post("/harmonic-components/")
async def get_harmonic_components(
    file: UploadFile = File(...), 
    api_key: APIKey = Depends(get_api_key)
):
    # Load the uploaded Excel file
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents), header=None)

    # Extract columns B to M (which correspond to columns 1 to 12 in zero-based indexing)
    columns_b_to_m = df.iloc[:, 1:13]

    # Convert the DataFrame to a two-dimensional array (list of lists)
    array_2d = columns_b_to_m.values.tolist()

    # Flatten the two-dimensional array to a single time series
    flattened_data = np.array(array_2d).flatten()

    # Calculate harmonic components
    frequencies, amplitudes, phases = calculate_harmonic_components(flattened_data)

    return {
        "frequencies": frequencies,
        "amplitudes": amplitudes,
        "phases": phases
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
