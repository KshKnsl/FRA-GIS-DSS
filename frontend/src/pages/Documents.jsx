import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  FileImage,
  File,
  Calendar,
  User,
  MapPin,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Archive
} from "lucide-react";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResults, setOcrResults] = useState(null);

  // Document categories based on FRA requirements
  const categories = [
    { id: "patta", name: "Patta Documents", icon: <File className="w-4 h-4" />, count: 0 },
    { id: "claim_form", name: "FRA Claims", icon: <FileText className="w-4 h-4" />, count: 0 },
    { id: "identity_proof", name: "Identity Proofs", icon: <User className="w-4 h-4" />, count: 0 },
    { id: "land_records", name: "Land Records", icon: <MapPin className="w-4 h-4" />, count: 0 },
    { id: "court_orders", name: "Legal Documents", icon: <FileText className="w-4 h-4" />, count: 0 },
    { id: "other", name: "Other Documents", icon: <Archive className="w-4 h-4" />, count: 0 }
  ];

  const states = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"];

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory, selectedState, selectedStatus]);

  const fetchDocuments = async () => {
    setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documents`);
      const data = await response.json();
      if (data.success)
        setDocuments(data.data);
      setLoading(false);
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.extracted_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedState !== "all") {
      filtered = filtered.filter(doc => doc.state === selectedState);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(doc => doc.status === selectedStatus);
    }

    setFilteredDocuments(filtered);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('category', selectedCategory !== 'all' ? selectedCategory : 'patta');
      formData.append('state', selectedState !== 'all' ? selectedState : 'Madhya Pradesh');

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documents/upload`, {
        method: 'POST',
        body: formData,
      });//unfinished

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          if (data.document && data.document.id) {
            fetchOCRResults(data.document.id);
          }
          fetchDocuments();
        }, 1000);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  const fetchOCRResults = async (documentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/documents/${documentId}/ocr`);
      const data = await response.json();

      if (data.success) {
        setOcrResults({
          confidence: data.data.confidence || 0.89,
          extracted_text: data.data.extracted_text || "OCR processing completed",
          entities: data.data.entities || {}
        });
      }
    } catch (error) {
      console.error('Error fetching OCR results:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "digitized":
        return <Badge className="bg-primary/10 text-primary">Digitized</Badge>;
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive">Failed</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>;
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-5 h-5 text-destructive" />;
      case "tiff":
      case "jpg":
      case "png":
        return <FileImage className="w-5 h-5 text-primary" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryStats = () => {
    return categories.map(cat => ({
      ...cat,
      count: documents.filter(doc => doc.category === cat.id).length
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-background text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" />
          Document Management
        </h1>
        <p className="text-muted-foreground text-lg">
          AI-powered document digitization, OCR processing, and FRA record management
        </p>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload & Process</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search & Filter Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search documents, applicants, content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="digitized">Digitized</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {getCategoryStats().map(cat => (
              <Card key={cat.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCategory(cat.id)}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    {cat.icon}
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{cat.count}</div>
                  <div className="text-sm text-muted-foreground">{cat.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading documents...</span>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map(doc => (
                    <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="p-2 bg-muted rounded-lg">
                            {getFileIcon(doc.file_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{doc.title}</h3>
                              {getStatusBadge(doc.status)}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {doc.applicant_name}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {doc.village}, {doc.district}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {doc.upload_date}
                              </div>
                              <div className="flex items-center gap-1">
                                <File className="w-4 h-4" />
                                {doc.file_size}
                              </div>
                            </div>

                            {doc.extracted_text && (
                              <div className="bg-secondary p-3 rounded-lg mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Zap className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium text-secondary-foreground">AI Extracted Text</span>
                                  <Badge className="bg-primary/10 text-primary">
                                    {(doc.ocr_confidence * 100).toFixed(0)}% confidence
                                  </Badge>
                                </div>
                                <p className="text-sm text-secondary-foreground line-clamp-2">
                                  {doc.extracted_text}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1">
                              {doc.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedCategory !== "all" || selectedState !== "all" || selectedStatus !== "all"
                      ? "Try adjusting your search criteria or filters."
                      : "Upload your first document to get started."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload & Process Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload FRA Documents</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload PDF, TIFF, or image files for AI-powered OCR processing and digitization
                  </p>

                  <div className="flex justify-center">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Button asChild>
                        <span>Choose Files</span>
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.tiff,.tif,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: PDF, TIFF, JPG, PNG (Max 50MB)
                  </p>
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="upload-category">Document Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="upload-state">State</Label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Uploading {selectedFile?.name}</span>
                          <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {uploadProgress < 100 ? "Uploading file..." : "Processing with AI..."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* OCR Results */}
                {ocrResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        AI Processing Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="font-medium">OCR Processing Complete</span>
                          <Badge className="bg-primary/10 text-primary">
                            {(ocrResults.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Extracted Entities:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(ocrResults.entities).map(([key, value]) => (
                              <div key={key} className="bg-muted p-3 rounded-lg">
                                <div className="text-sm text-muted-foreground capitalize">
                                  {key.replace('_', ' ')}
                                </div>
                                <div className="font-medium">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Extracted Text:</h4>
                          <div className="bg-muted p-4 rounded-lg max-h-32 overflow-y-auto">
                            <p className="text-sm">{ocrResults.extracted_text}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button>Save Document</Button>
                          <Button variant="outline">Process Another</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Processing Features */}
                <Card>
                  <CardHeader>
                    <CardTitle>AI Processing Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">OCR & Text Extraction</h4>
                          <p className="text-sm text-muted-foreground">
                            Advanced OCR for handwritten and printed documents
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Entity Recognition</h4>
                          <p className="text-sm text-muted-foreground">
                            Automatic identification of villages, applicants, and claim types
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Document Classification</h4>
                          <p className="text-sm text-muted-foreground">
                            Smart categorization of FRA claims, pattas, and legal documents
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Search & Indexing</h4>
                          <p className="text-sm text-muted-foreground">
                            Full-text search across all digitized documents
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
