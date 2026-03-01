import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useCAProfile } from "@/hooks/use-ca-profile";
import { User, Mail, Pencil, Save, X, Phone, Award, Briefcase, GraduationCap, FileText, Upload, Trash2, CheckCircle, Shield, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

const CASettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData: caProfileData, updateProfileData: updateCAProfile, isProfileComplete, submitForReview } = useCAProfile();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  
  const certificationInputRef = useRef<HTMLInputElement>(null);
  const idProofInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: caProfileData.phone || "",
  });

  const [professionalData, setProfessionalData] = useState({
    qualification: caProfileData.qualification || "",
    membershipNumber: caProfileData.membershipNumber || "",
    experience: caProfileData.experience || "",
    specialization: caProfileData.specialization || "",
    firmName: caProfileData.firmName || "",
    firmAddress: "",
    bio: caProfileData.bio || "",
  });

  const [certificationDocuments, setCertificationDocuments] = useState<UploadedDocument[]>([]);
  const [idProofDocuments, setIdProofDocuments] = useState<UploadedDocument[]>([]);

  // Update CA profile context when documents change
  useEffect(() => {
    updateCAProfile({
      hasCertifications: certificationDocuments.length > 0,
      hasIdProof: idProofDocuments.length > 0,
    });
  }, [certificationDocuments, idProofDocuments]);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>,
    documentType: string
  ) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload PDF, JPG, or PNG files only.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB.",
          variant: "destructive",
        });
        return;
      }

      const newDocument: UploadedDocument = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };

      setDocuments((prev) => [...prev, newDocument]);
      
      toast({
        title: "Document uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    });

    // Reset input
    event.target.value = '';
  };

  const handleRemoveDocument = (
    documentId: string,
    setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>
  ) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    toast({
      title: "Document removed",
      description: "The document has been removed.",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSaveProfile = () => {
    // TODO: Call profile update API when available
    updateCAProfile({ phone: profileData.phone });
    setIsEditingProfile(false);
    toast({
      title: "Profile saved",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleCancelProfile = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: caProfileData.phone || "",
    });
    setIsEditingProfile(false);
  };

  const handleSaveProfessional = () => {
    updateCAProfile({
      qualification: professionalData.qualification,
      membershipNumber: professionalData.membershipNumber,
      experience: professionalData.experience,
      specialization: professionalData.specialization,
      firmName: professionalData.firmName,
      bio: professionalData.bio,
    });
    setIsEditingProfessional(false);
    toast({
      title: "Professional details saved",
      description: "Your professional information has been updated successfully.",
    });
  };

  const handleCancelProfessional = () => {
    setProfessionalData({
      qualification: caProfileData.qualification || "",
      membershipNumber: caProfileData.membershipNumber || "",
      experience: caProfileData.experience || "",
      specialization: caProfileData.specialization || "",
      firmName: caProfileData.firmName || "",
      firmAddress: "",
      bio: caProfileData.bio || "",
    });
    setIsEditingProfessional(false);
  };

  const handleSubmitForReview = () => {
    if (!isProfileComplete()) {
      toast({
        title: "Profile incomplete",
        description: "Please fill in all required fields and upload documents before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitForReview();
    toast({
      title: "Profile submitted",
      description: "Your profile has been submitted for review. We'll notify you once verified.",
    });
  };

  const DocumentUploadCard = ({
    title,
    description,
    icon: Icon,
    documents,
    setDocuments,
    inputRef,
    documentType,
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    documents: UploadedDocument[];
    setDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
    inputRef: React.RefObject<HTMLInputElement>;
    documentType: string;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => handleFileUpload(e, setDocuments, documentType)}
          />
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 5MB)</p>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uploaded Documents</Label>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveDocument(doc.id, setDocuments)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <Helmet><title>Numor - CA Settings</title></Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">CA Profile Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your professional profile and credentials.</p>
        </div>
        {!caProfileData.isSubmitted && (
          <Button 
            onClick={handleSubmitForReview}
            disabled={!isProfileComplete()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit for Review
          </Button>
        )}
        {caProfileData.isSubmitted && (
          <Badge variant="secondary" className="text-sm py-1.5 px-3">
            <CheckCircle className="w-4 h-4 mr-2" />
            Submitted for Review
          </Badge>
        )}
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
            <CardDescription className="text-sm">Your personal contact details</CardDescription>
          </div>
          {!isEditingProfile ? (
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => setIsEditingProfile(true)}>
              <Pencil className="w-3 h-3 mr-1.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={handleCancelProfile}>
                <X className="w-3 h-3 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleSaveProfile}>
                <Save className="w-3 h-3 mr-1.5" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </Label>
              {isEditingProfile ? (
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {profileData.name || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </Label>
              <p className="text-sm py-2 px-3 bg-muted/50 rounded-md text-muted-foreground">
                {profileData.email || "Not set"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              {isEditingProfile ? (
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {profileData.phone || "Not set"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Professional Details</CardTitle>
            <CardDescription className="text-sm">Your qualifications, experience, and certifications</CardDescription>
          </div>
          {!isEditingProfessional ? (
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => setIsEditingProfessional(true)}>
              <Pencil className="w-3 h-3 mr-1.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={handleCancelProfessional}>
                <X className="w-3 h-3 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleSaveProfessional}>
                <Save className="w-3 h-3 mr-1.5" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qualification" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                Qualification
              </Label>
              {isEditingProfessional ? (
                <Select 
                  value={professionalData.qualification} 
                  onValueChange={(value) => setProfessionalData({ ...professionalData, qualification: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ca">Chartered Accountant (CA)</SelectItem>
                    <SelectItem value="cpa">Certified Public Accountant (CPA)</SelectItem>
                    <SelectItem value="cfa">Chartered Financial Analyst (CFA)</SelectItem>
                    <SelectItem value="cma">Certified Management Accountant (CMA)</SelectItem>
                    <SelectItem value="other">Other Professional Certification</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {professionalData.qualification ? 
                    { ca: "Chartered Accountant (CA)", cpa: "Certified Public Accountant (CPA)", cfa: "Chartered Financial Analyst (CFA)", cma: "Certified Management Accountant (CMA)", other: "Other Professional Certification" }[professionalData.qualification] 
                    : "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="membershipNumber" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Membership Number
              </Label>
              {isEditingProfessional ? (
                <Input
                  id="membershipNumber"
                  value={professionalData.membershipNumber}
                  onChange={(e) => setProfessionalData({ ...professionalData, membershipNumber: e.target.value })}
                  placeholder="Enter your membership number"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {professionalData.membershipNumber || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Years of Experience
              </Label>
              {isEditingProfessional ? (
                <Select 
                  value={professionalData.experience} 
                  onValueChange={(value) => setProfessionalData({ ...professionalData, experience: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3">0-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10-15">10-15 years</SelectItem>
                    <SelectItem value="15+">15+ years</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {professionalData.experience ? `${professionalData.experience} years` : "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                Specialization
              </Label>
              {isEditingProfessional ? (
                <Select 
                  value={professionalData.specialization} 
                  onValueChange={(value) => setProfessionalData({ ...professionalData, specialization: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax">Tax Advisory</SelectItem>
                    <SelectItem value="audit">Audit & Assurance</SelectItem>
                    <SelectItem value="corporate">Corporate Finance</SelectItem>
                    <SelectItem value="consulting">Financial Consulting</SelectItem>
                    <SelectItem value="bookkeeping">Bookkeeping & Accounting</SelectItem>
                    <SelectItem value="compliance">Regulatory Compliance</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {professionalData.specialization ? 
                    { tax: "Tax Advisory", audit: "Audit & Assurance", corporate: "Corporate Finance", consulting: "Financial Consulting", bookkeeping: "Bookkeeping & Accounting", compliance: "Regulatory Compliance" }[professionalData.specialization] 
                    : "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmName" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Firm Name
              </Label>
              {isEditingProfessional ? (
                <Input
                  id="firmName"
                  value={professionalData.firmName}
                  onChange={(e) => setProfessionalData({ ...professionalData, firmName: e.target.value })}
                  placeholder="Enter your firm name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {professionalData.firmName || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmAddress" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Firm Address
              </Label>
              {isEditingProfessional ? (
                <Input
                  id="firmAddress"
                  value={professionalData.firmAddress}
                  onChange={(e) => setProfessionalData({ ...professionalData, firmAddress: e.target.value })}
                  placeholder="Enter your firm address"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {professionalData.firmAddress || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio" className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Professional Bio
              </Label>
              {isEditingProfessional ? (
                <Textarea
                  id="bio"
                  value={professionalData.bio}
                  onChange={(e) => setProfessionalData({ ...professionalData, bio: e.target.value })}
                  placeholder="Tell us about your experience and expertise..."
                  rows={4}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[80px] whitespace-pre-wrap">
                  {professionalData.bio || "Not set"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <DocumentUploadCard
          title="Certifications"
          description="Upload your professional certificates (CA, CPA, etc.)"
          icon={GraduationCap}
          documents={certificationDocuments}
          setDocuments={setCertificationDocuments}
          inputRef={certificationInputRef}
          documentType="certification"
        />

        <DocumentUploadCard
          title="ID Proof"
          description="Upload government-issued ID for verification"
          icon={Shield}
          documents={idProofDocuments}
          setDocuments={setIdProofDocuments}
          inputRef={idProofInputRef}
          documentType="id_proof"
        />
      </div>
    </div>
  );
};

export default CASettings;
