import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Pencil, Save, X, Phone, Award, Briefcase, GraduationCap, FileText } from "lucide-react";

const CASettings = () => {
  const user = getCurrentUser();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingProfessional, setIsEditingProfessional] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [professionalData, setProfessionalData] = useState({
    qualification: "",
    membershipNumber: "",
    experience: "",
    specialization: "",
    firmName: "",
    firmAddress: "",
    bio: "",
  });

  const handleSaveProfile = () => {
    if (user) {
      user.name = profileData.name;
    }
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
      phone: "",
    });
    setIsEditingProfile(false);
  };

  const handleSaveProfessional = () => {
    setIsEditingProfessional(false);
    toast({
      title: "Professional details saved",
      description: "Your professional information has been updated successfully.",
    });
  };

  const handleCancelProfessional = () => {
    setProfessionalData({
      qualification: "",
      membershipNumber: "",
      experience: "",
      specialization: "",
      firmName: "",
      firmAddress: "",
      bio: "",
    });
    setIsEditingProfessional(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">CA Profile Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your professional profile and credentials.</p>
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
    </div>
  );
};

export default CASettings;
