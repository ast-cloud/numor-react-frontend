import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { fetchCurrentOrganization, updateOrganization, fetchCurrentUser, updateUserProfile } from "@/lib/api/user";
import { User, Building2, Mail, Pencil, Save, X, Phone, FileText, MapPin, Upload, Trash2, Loader2 } from "lucide-react";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { INDIAN_STATES } from "@/lib/constants";

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

const SMESettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [originalCompanyData, setOriginalCompanyData] = useState({
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    taxId: "",
    email: "",
    phone: "",
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        const data = {
          name: userData.name || user?.name || "",
          email: userData.email || user?.email || "",
          phone: userData.phone || "",
        };
        setProfileData(data);
        setOriginalProfileData(data);
      } catch {
        // fallback to auth context
      }
    };
    loadUser();
  }, [user]);

  const [companyData, setCompanyData] = useState({
    name: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    taxId: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const loadOrganization = async () => {
      try {
        const org = await fetchCurrentOrganization();
        const orgData = {
          name: org.name || "",
          streetAddress: org.streetAddress || "",
          city: org.city || "",
          state: org.state || "",
          zipCode: org.zipCode || "",
          country: org.country || "",
          taxId: org.taxId || "",
          email: org.email || "",
          phone: org.phone || "",
        };
        setCompanyData(orgData);
        setOriginalCompanyData(orgData);
        if (org.logoUrl) {
          setCompanyLogo(org.logoUrl);
        }
      } catch {
        toast({
          title: "Failed to load organization",
          description: "Could not fetch your company details.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOrg(false);
      }
    };
    loadOrganization();
  }, [toast]);


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

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateUserProfile({ name: profileData.name, phone: profileData.phone });
      setOriginalProfileData({ ...profileData });
      setIsEditingProfile(false);
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    } catch {
      toast({
        title: "Failed to save",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setProfileData({ ...originalProfileData });
    setIsEditingProfile(false);
  };

  const [isSavingCompany, setIsSavingCompany] = useState(false);

  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    try {
      await updateOrganization(companyData);
      setOriginalCompanyData({ ...companyData });
      setIsEditingCompany(false);
      toast({
        title: "Company details saved",
        description: "Your company information has been updated successfully.",
      });
    } catch {
      toast({
        title: "Failed to save",
        description: "Could not update company details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleCancelCompany = () => {
    setCompanyData({ ...originalCompanyData });
    setIsEditingCompany(false);
  };

  return (
    <div className="space-y-8">
      <Helmet><title>Numor - Settings</title></Helmet>
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
              <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleSaveProfile} disabled={isSavingProfile}>
                {isSavingProfile ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                {isSavingProfile ? "Saving..." : "Save"}
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
              <Button size="sm" className="h-7 text-xs px-2.5" onClick={handleSaveCompany} disabled={isSavingCompany}>
                {isSavingCompany ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                {isSavingCompany ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingOrg ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <>
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
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {companyData.name || "Not set"}
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

          </div>

          {/* Address Subgroup */}
          <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="w-4 h-4" />
              Business Address
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="streetAddress">Street Address</Label>
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
                  companyData.country === "India" ? (
                    <Select
                      value={companyData.state}
                      onValueChange={(value) => setCompanyData({ ...companyData, state: value })}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      value={companyData.state}
                      onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                      placeholder="Enter state"
                    />
                  )
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
                    value={companyData.zipCode}
                    onChange={(e) => setCompanyData({ ...companyData, zipCode: e.target.value })}
                    placeholder="Enter ZIP code"
                  />
                ) : (
                  <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                    {companyData.zipCode || "Not set"}
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
          </div>
          </>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default SMESettings;
