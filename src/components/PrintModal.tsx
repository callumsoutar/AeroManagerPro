import React, { useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import InvoiceTemplate from '../pdf-templates/InvoiceTemplate';
import { toast } from 'sonner';
import type { InvoiceData } from '../types/invoice';

interface PrintModalProps {
  invoice: InvoiceData;
  onComplete: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ invoice, onComplete }) => {
  useEffect(() => {
    const generateAndPrint = async () => {
      try {
        // Generate the PDF blob
        const blob = await pdf(<InvoiceTemplate invoice={invoice} />).toBlob();
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Open in new window and print
        const printWindow = window.open(url);
        
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            URL.revokeObjectURL(url);
          };
        } else {
          toast.error('Please allow popups to print');
        }
      } catch (error) {
        console.error('Print failed:', error);
        toast.error('Failed to generate print preview');
      } finally {
        onComplete();
      }
    };

    generateAndPrint();
  }, [invoice, onComplete]);

  return null; // This component doesn't render anything
}; 