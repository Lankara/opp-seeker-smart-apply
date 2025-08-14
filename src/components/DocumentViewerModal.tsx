import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Mail } from 'lucide-react';
import jsPDF from 'jspdf';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetter: string;
  cv: string;
  jobTitle: string;
  companyName: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  coverLetter,
  cv,
  jobTitle,
  companyName
}) => {
  const [activeTab, setActiveTab] = useState('cover-letter');

  const generatePDF = (content: string, filename: string) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Split content into lines and add to PDF
    const lines = pdf.splitTextToSize(content, maxWidth);
    let yPosition = margin;
    
    lines.forEach((line: string) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 7;
    });
    
    pdf.save(filename);
  };

  const downloadCoverLetter = () => {
    generatePDF(coverLetter, `Cover_Letter_${companyName}_${jobTitle}.pdf`);
  };

  const downloadCV = () => {
    generatePDF(cv, `CV_${companyName}_${jobTitle}.pdf`);
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'mb-4' : 'mb-2'}>
        {line.trim() === '' ? '\u00A0' : line}
      </p>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Application Documents - {jobTitle} at {companyName}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cover-letter" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Cover Letter
            </TabsTrigger>
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              CV/Resume
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="cover-letter" className="mt-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cover Letter</h3>
              <Button onClick={downloadCoverLetter} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <div className="bg-background border rounded-lg p-6 h-[500px] overflow-y-auto">
              <div className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {formatContent(coverLetter)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cv" className="mt-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">CV/Resume</h3>
              <Button onClick={downloadCV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
            <div className="bg-background border rounded-lg p-6 h-[500px] overflow-y-auto">
              <div className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {formatContent(cv)}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={() => {
              downloadCoverLetter();
              downloadCV();
            }}
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Both
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};