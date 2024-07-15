"use client";

import { useState } from "react";
import Papa from "papaparse";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CopyToClipboard } from "./lukacho/copy-to-clipboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "./ui/skeleton";

interface Data {
  frequencies: number[];
  amplitudes: number[];
  phases: number[];
}

export function Fourier() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<Data>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<number[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error state
    if (!file) {
      alert("Please select a file first.");
      setLoading(false);
      return;
    }

    Papa.parse(file, {
      complete: async (results) => {
        const data = results.data as any[][];

        // Use a single map to extract both yearsArray and columnsBtoM
        const yearsArray: number[] = [];
        const columnsBtoM: number[] = [];

        data.forEach((row) => {
          yearsArray.push(row[0]);
          columnsBtoM.push(...row.slice(1, 13));
        });

        setYears(yearsArray);

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(columnsBtoM),
          });

          if (response.ok) {
            const data = await response.json();
            setResponse(data);
          } else {
            const errorMessage = await response.text();
            setError(`Error: ${response.status} - ${errorMessage}`);
            console.error("Error:", errorMessage);
          }
        } catch (error) {
          if (error instanceof Error) {
            setError(`Error: ${error.message}`);
            console.error("Error:", error);
          }
        } finally {
          setLoading(false);
        }
      },
      header: false,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col items-center gap-6 mb-8">
        <h1 className="text-2xl font-bold">
          Análise de regressão periódica da precipitação mensal,
        </h1>
        <form
          className="flex items-center gap-4 w-full max-w-md"
          onSubmit={handleUpload}
        >
          <Input
            type="file"
            accept=".csv"
            placeholder="Select a csv file"
            onChange={handleFileChange}
            className="flex-1 h-full"
          />
          <Button size="lg" type="submit" disabled={loading}>
            {loading ? "Analisando..." : "Analisar"}
          </Button>
        </form>
        {error && <ErrorAlert error={error} />}
      </div>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="flex flex-col items-center gap-6 mb-8">
            {/* Your existing content here */}
          </div>
          {response ? (
            <div className="flex flex-col gap-4">
              <DataCard title="Fases" data={response.phases} />
              <DataCard title="Frequencias" data={response.frequencies} />
              <DataCard title="Amplitudes" data={response.amplitudes} />
              <DataCard title="Anos analisados" data={years} />
            </div>
          ) : null}
          {years.length > 0 && (
            <div className="flex flex-col gap-4 mt-8">
              {/* Years card here */}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ErrorAlert = ({ error }: { error: string }) => {
  return (
    <Alert variant="destructive">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertTitle>Algo deu errado, contate o suporte</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

const DataCard = ({ title, data }: { title: string; data: number[] }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <CopyToClipboard copy={data.toString()} />
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="p-2 rounded-md bg-foreground text-primary-foreground overflow-x-auto max-h-64">
          {data.map((data) => (
            <span key={data}>{data}, </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      <DataSkeleton title="Anos analisados" />
      <DataSkeleton title="Fases" />
      <DataSkeleton title="Frequencias" />
      <DataSkeleton title="Amplitudes" />
    </div>
  );
};

const DataSkeleton = ({ title }: { title: string }) => {
  return (
    <div className="p-4 gap-4 flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {title}
      </h3>
      <Skeleton className="h-40 w-full" /> {/* Data content skeleton */}
    </div>
  );
};
