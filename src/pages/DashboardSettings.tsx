import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Mail, Pencil, Save, X, Phone, FileText, MapPin } from "lucide-react";

const DashboardSettings = () => {
  const user = getCurrentUser();
  const { toast } = useToast();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [companyData, setCompanyData] = useState({
    companyName: user?.company || "",
    address: "",
    taxId: "",
    email: "",
    phone: "",
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
    });
    setIsEditingProfile(false);
  };

  const handleSaveCompany = () => {
    if (user) {
      user.company = companyData.companyName;
    }
    setIsEditingCompany(false);
    toast({
      title: "Company details saved",
      description: "Your company information has been updated successfully.",
    });
  };

  const handleCancelCompany = () => {
    setCompanyData({
      companyName: user?.company || "",
      address: "",
      taxId: "",
      email: "",
      phone: "",
    });
    setIsEditingCompany(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </div>
          {!isEditingProfile ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelProfile}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
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
              <Label htmlFor="primaryEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Primary Email
              </Label>
              <p className="text-sm py-2 px-3 bg-muted/50 rounded-md text-muted-foreground">
                {profileData.email || "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Your business information for invoices and documents</CardDescription>
          </div>
          {!isEditingCompany ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditingCompany(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelCompany}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveCompany}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Company Name
              </Label>
              {isEditingCompany ? (
                <Input
                  id="companyName"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.companyName || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Tax ID / GST Number
              </Label>
              {isEditingCompany ? (
                <Input
                  id="taxId"
                  value={companyData.taxId}
                  onChange={(e) => setCompanyData({ ...companyData, taxId: e.target.value })}
                  placeholder="Enter tax ID"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.taxId || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Company Email
              </Label>
              {isEditingCompany ? (
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  placeholder="Enter company email"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.email || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyPhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              {isEditingCompany ? (
                <Input
                  id="companyPhone"
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.phone || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Address
              </Label>
              {isEditingCompany ? (
                <Textarea
                  id="address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="Enter company address"
                  rows={3}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md min-h-[60px] whitespace-pre-wrap">
                  {companyData.address || "Not set"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
