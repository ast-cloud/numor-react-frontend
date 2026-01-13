import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User, ArrowLeft, Briefcase, Award, Phone, Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { registerUser } from "@/lib/authStore";

const ExpertSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    experience: "",
    specialization: "",
    bio: "",
    agreeToTerms: false,
  });
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      console.log("Submitting expert application:", {
        formData,
        certificationFiles: certificationFiles.map(f => ({ name: f.name, size: f.size, type: f.type })),
        idProofFile: idProofFile ? { name: idProofFile.name, size: idProofFile.size, type: idProofFile.type } : null,
      });

      // Register user with both regular_user and ca roles
      const result = registerUser({
        name: formData.fullName,
        company: "",
        email: formData.email,
        password: formData.password,
        roles: ["regular_user", "ca"],
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Simulate additional API call for expert-specific data
      await new Promise(resolve => setTimeout(resolve, 1000));

      // On success, navigate to success page
      navigate("/expert-application-success");
    } catch (error: any) {
      // On failure, show error toast
      toast({
        title: "Submission Failed",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCertificationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setCertificationFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = "";
  };

  const removeCertification = (index: number) => {
    setCertificationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIdProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdProofFile(file);
    }
    e.target.value = "";
  };

  const removeIdProof = () => {
    setIdProofFile(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Back button */}
        <Link
          to="/ca"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to For Financial Experts
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">N</span>
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Numor</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Apply as a Financial Expert
          </h1>
          <p className="text-muted-foreground">
            Join our network of trusted CAs and financial advisors
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange("fullName")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground">Professional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Select onValueChange={handleSelectChange("qualification")} required>
                <SelectTrigger className="w-full">
                  <Award className="w-4 h-4 text-muted-foreground mr-2" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Select onValueChange={handleSelectChange("experience")} required>
                <SelectTrigger className="w-full">
                  <Briefcase className="w-4 h-4 text-muted-foreground mr-2" />
                  <SelectValue placeholder="Select your experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10-15">10-15 years</SelectItem>
                  <SelectItem value="15+">15+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select onValueChange={handleSelectChange("specialization")} required>
                <SelectTrigger className="w-full">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your experience and expertise..."
                value={formData.bio}
                onChange={handleChange("bio")}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground">Document Verification</h3>
            
            {/* Certification Upload */}
            <div className="space-y-2">
              <Label>Professional Certifications</Label>
              <p className="text-xs text-muted-foreground">
                Upload your CA/CPA/CFA certificate and any other relevant credentials
              </p>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <label htmlFor="certifications" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload certifications</span>
                  <span className="text-xs text-muted-foreground">(PDF, JPG, PNG - Max 5MB each)</span>
                  <input
                    id="certifications"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleCertificationUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {certificationFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {certificationFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ID Proof Upload */}
            <div className="space-y-2">
              <Label>Government ID Proof</Label>
              <p className="text-xs text-muted-foreground">
                Upload a valid government-issued ID (Passport, Driver's License, Aadhar, etc.)
              </p>
              {!idProofFile ? (
                <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <label htmlFor="idProof" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload ID proof</span>
                    <span className="text-xs text-muted-foreground">(PDF, JPG, PNG - Max 5MB)</span>
                    <input
                      id="idProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleIdProofUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm truncate max-w-[200px]">{idProofFile.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(idProofFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeIdProof}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground">Account Security</h3>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 pt-4">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => 
                setFormData((prev) => ({ ...prev, agreeToTerms: checked === true }))
              }
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , and confirm that all information provided is accurate.
            </Label>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an expert account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ExpertSignup;
