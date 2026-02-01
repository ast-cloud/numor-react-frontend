import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Mail, Pencil, Save, X, Phone, FileText, MapPin, Upload, Trash2 } from "lucide-react";

const COUNTRIES = [
  "India",
  "UAE",
  "United States",
  "United Kingdom",
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

const DashboardSettings = () => {
  const user = getCurrentUser();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [companyData, setCompanyData] = useState({
    companyName: user?.company || "",
    streetAddress: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    taxId: "",
    email: "",
    phone: "",
  });


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result as string);
        toast({
          title: "Logo uploaded",
          description: "Your company logo has been updated.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Logo removed",
      description: "Your company logo has been removed.",
    });
  };

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
      streetAddress: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      taxId: "",
      email: "",
      phone: "",
    });
    setIsEditingCompany(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage your account and preferences.</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
            <CardDescription className="text-sm">Your personal details</CardDescription>
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
              <Label htmlFor="primaryEmail" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Primary Email
              </Label>
              <p className="text-sm py-2 px-3 bg-muted/50 rounded-md text-muted-foreground">
                {profileData.email || "Not set"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profilePhone" className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number
              </Label>
              {isEditingProfile ? (
                <Input
                  id="profilePhone"
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

      {/* Company Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Company Details</CardTitle>
            <CardDescription className="text-sm">Your business information for invoices and documents</CardDescription>
          </div>
          {!isEditingCompany ? (
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => setIsEditingCompany(true)}>
              <Pencil className="w-3 h-3 mr-1.5" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={handleCancelCompany}>
                <X className="w-3 h-3 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleSaveCompany}>
                <Save className="w-3 h-3 mr-1.5" />
                Save
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Logo Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-muted-foreground" />
              Company Logo
            </Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Upload
                </Button>
                {companyLogo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="w-3 h-3 mr-1.5" />
                    Remove
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

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
              <Label htmlFor="streetAddress" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Street Address
              </Label>
              {isEditingCompany ? (
                <Input
                  id="streetAddress"
                  value={companyData.streetAddress}
                  onChange={(e) => setCompanyData({ ...companyData, streetAddress: e.target.value })}
                  placeholder="Enter street address"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.streetAddress || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isEditingCompany ? (
                <Input
                  id="city"
                  value={companyData.city}
                  onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                  placeholder="Enter city"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.city || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              {isEditingCompany ? (
                <Input
                  id="state"
                  value={companyData.state}
                  onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                  placeholder="Enter state"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.state || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              {isEditingCompany ? (
                <Input
                  id="zip"
                  value={companyData.zip}
                  onChange={(e) => setCompanyData({ ...companyData, zip: e.target.value })}
                  placeholder="Enter ZIP code"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.zip || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              {isEditingCompany ? (
                <Select
                  value={companyData.country}
                  onValueChange={(value) => setCompanyData({ ...companyData, country: value })}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.country || "Not set"}
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
