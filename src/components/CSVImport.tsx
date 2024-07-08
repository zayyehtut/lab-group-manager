import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type CSVData = {
  [key: string]: string;
};

type CSVImportProps = {
  onImport: (data: CSVData[]) => void;
};

export function CSVImport({ onImport }: CSVImportProps) {
  const [csvData, setCSVData] = useState<CSVData[]>([]);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      complete: (result) => {
        setCSVData(result.data as CSVData[]);
      },
      header: true,
      skipEmptyLines: true,
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
  });

  const handleImport = () => {
    if (csvData.length > 0) {
      onImport(csvData);
      toast({
        title: "Success",
        description: `Imported ${csvData.length} records.`,
      });
    } else {
      toast({
        title: "Error",
        description: "No data to import.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Import Students from CSV</h2>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed rounded-md text-center cursor-pointer ${
            isDragActive ? "border-primary" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the CSV file here ...</p>
          ) : (
            <p>Drag 'n' drop a CSV file here, or click to select one</p>
          )}
        </div>
        {csvData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Preview:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(csvData[0]).map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.slice(0, 5).map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell key={cellIndex}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {csvData.length > 5 && (
              <p className="mt-2 text-sm text-gray-500">
                Showing first 5 rows of {csvData.length} total rows
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={csvData.length === 0}>
          Import Data
        </Button>
      </CardFooter>
    </Card>
  );
}
