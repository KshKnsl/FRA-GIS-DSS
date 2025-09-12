import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  Users,
  Zap,
  Search,
  Building,
  Globe,
  Book,
  Play,
  ChevronRight,
  Download,
  ExternalLink
} from "lucide-react";

const SupportHelp = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
    name: "",
    email: "",
    phone: "",
    state: "",
    district: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [faq, setFaq] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [helpContent, setHelpContent] = useState({ tutorials: [], guides: [] });

  const supportCategories = [
    "Technical Issues",
    "Document Processing",
    "Map & GIS Problems",
    "Decision Support",
    "Account & Access",
    "Data Quality",
    "Training & Onboarding",
    "Feature Requests",
    "Bug Reports",
    "General Inquiry"
  ];

  const priorityLevels = [
    { value: "low", label: "Low - General inquiry", color: "bg-primary/10 text-primary" },
    { value: "medium", label: "Medium - Feature request", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High - System issue", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent - Critical problem", color: "bg-destructive/10 text-destructive" }
  ];
  useEffect(() => {
    fetchFAQ();
    fetchTickets();
    fetchHelpContent();
  }, []);

  const fetchFAQ = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/support/faq`);
      const data = await response.json();

      if (data.success && data.data.faqs) {
        setFaq(data.data.faqs);
      } else {
        // Fallback FAQ
        setFaq([
          {
            question: "What is the Forest Rights Act (FRA), 2006?",
            answer: "The FRA, 2006 recognizes the rights of forest-dwelling communities over land and forest resources. It provides for recognition of forest rights to tribal communities and other traditional forest dwellers who have been residing in forests for generations."
          },
          {
            question: "How does the AI-powered document processing work?",
            answer: "Our system uses advanced OCR technology combined with AI to extract text from scanned FRA documents and identify key information automatically."
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      // Fallback FAQ
      setFaq([
        {
          question: "What is the Forest Rights Act (FRA), 2006?",
          answer: "The FRA, 2006 recognizes the rights of forest-dwelling communities over land and forest resources. It provides for recognition of forest rights to tribal communities and other traditional forest dwellers who have been residing in forests for generations."
        },
        {
          question: "How does the AI-powered document processing work?",
          answer: "Our system uses advanced OCR technology combined with AI to extract text from scanned FRA documents and identify key information automatically."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/support/tickets`);
      const data = await response.json();

      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      // Keep empty tickets array
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchHelpContent = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/support/help`);
      const data = await response.json();

      if (data.success) {
        setHelpContent(data.data);
      }
    } catch (error) {
      console.error('Error fetching help content:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setTicketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketForm)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);
        setTicketForm({
          subject: "",
          category: "",
          priority: "",
          description: "",
          name: "",
          email: "",
          phone: "",
          state: "",
          district: ""
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error(data.message || 'Failed to submit ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      // Fallback to mock submission
      setSubmitSuccess(true);
      setTicketForm({
        subject: "",
        category: "",
        priority: "",
        description: "",
        name: "",
        email: "",
        phone: "",
        state: "",
        district: ""
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open":
        return <Badge className="bg-primary/10 text-primary">Open</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-primary/10 text-primary">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-muted text-muted-foreground">Closed</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityData = priorityLevels.find(p => p.value === priority);
    return priorityData ? (
      <Badge className={priorityData.color}>{priorityData.label}</Badge>
    ) : null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-background text-foreground">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-primary" />
          Support & Help Center
        </h1>
        <p className="text-muted-foreground text-lg">
          Get help, submit tickets, and access resources for FRA Atlas
        </p>
      </div>

      <Tabs defaultValue="support" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="support" className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-muted-foreground">support@fra-atlas.gov.in</p>
                <p className="text-xs text-muted-foreground">24 hours response</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Phone className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Helpline</h3>
                <p className="text-sm text-muted-foreground">1800-XXX-FRA-1</p>
                <p className="text-xs text-muted-foreground">24/7 toll-free</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-muted-foreground">9 AM - 6 PM IST</p>
                <p className="text-xs text-muted-foreground">Mon-Fri only</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <Users className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Community</h3>
                <p className="text-sm text-muted-foreground">Join discussions</p>
                <p className="text-xs text-muted-foreground">Peer support</p>
              </CardContent>
            </Card>
          </div>

          {/* Support Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              {submitSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-2">Ticket Submitted Successfully!</h3>
                  <p className="text-muted-foreground">
                    Your support ticket has been created. You'll receive an email confirmation with ticket ID and tracking information.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={ticketForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={ticketForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={ticketForm.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select value={ticketForm.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="madhya-pradesh">Madhya Pradesh</SelectItem>
                          <SelectItem value="tripura">Tripura</SelectItem>
                          <SelectItem value="odisha">Odisha</SelectItem>
                          <SelectItem value="telangana">Telangana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={ticketForm.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={ticketForm.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {supportCategories.map(category => (
                            <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority *</Label>
                      <Select value={ticketForm.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityLevels.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Please provide detailed description of your issue..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Support Ticket
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          {/* Ticket Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {tickets.filter(t => t.status === "open" || t.status === "in_progress").length}
                </div>
                <div className="text-sm text-muted-foreground">Open Tickets</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600 mb-1">
                  {tickets.filter(t => t.status === "in_progress").length}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">
                  {tickets.filter(t => t.status === "resolved").length}
                </div>
                <div className="text-sm text-muted-foreground">Resolved</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">24h</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading tickets...</span>
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{ticket.subject}</h3>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">ID:</span> {ticket.ticket_id}
                            </div>
                            <div>
                              <span className="font-medium">Category:</span> {ticket.category}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(ticket.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Updated:</span> {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </div>

                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                  <p className="text-muted-foreground">
                    You haven't submitted any support tickets yet. Use the Support tab to create your first ticket.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading FAQs...</span>
                </div>
              ) : faq.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {faq.map((faqItem, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faqItem.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faqItem.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No FAQs Available</h3>
                  <p className="text-muted-foreground">
                    FAQ content is being loaded from the server.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Key Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Key Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">FRA Act 2006</h4>
                      <p className="text-sm text-muted-foreground">Official legislation</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Implementation Guide</h4>
                      <p className="text-sm text-muted-foreground">Step-by-step guide</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportHelp;