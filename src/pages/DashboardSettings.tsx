import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Mail, Pencil, Save, X, Phone, FileText, MapPin, Upload, Trash2, Plus, Users } from "lucide-react";

interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

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
    address: "",
    taxId: "",
    email: "",
    phone: "",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const handleAddClient = () => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: "",
      address: "",
      email: "",
      phone: "",
    };
    setClients([...clients, newClient]);
    setEditingClientId(newClient.id);
  };

  const handleUpdateClient = (id: string, field: keyof Client, value: string) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client && !client.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }
    setEditingClientId(null);
    toast({
      title: "Client saved",
      description: "Client information has been saved.",
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast({
      title: "Client removed",
      description: "Client has been removed from your list.",
    });
  };

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

      {/* Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Clients</CardTitle>
            <CardDescription className="text-sm">Manage your client information for invoices</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={handleAddClient}>
            <Plus className="w-3 h-3 mr-1.5" />
            Add Client
          </Button>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No clients added yet</p>
              <p className="text-sm">Click "Add Client" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {client.name || "New Client"}
                    </h4>
                    <div className="flex gap-2">
                      {editingClientId === client.id ? (
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveClient(client.id)}>
                          <Save className="w-3 h-3 mr-1.5" />
                          Save
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingClientId(client.id)}>
                          <Pencil className="w-3 h-3 mr-1.5" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-muted-foreground" />
                        Name
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          value={client.name}
                          onChange={(e) => handleUpdateClient(client.id, "name", e.target.value)}
                          placeholder="Client name"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.name || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        Email
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          type="email"
                          value={client.email}
                          onChange={(e) => handleUpdateClient(client.id, "email", e.target.value)}
                          placeholder="Client email"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.email || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        Phone
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          type="tel"
                          value={client.phone}
                          onChange={(e) => handleUpdateClient(client.id, "phone", e.target.value)}
                          placeholder="Client phone"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.phone || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        Address
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          value={client.address}
                          onChange={(e) => handleUpdateClient(client.id, "address", e.target.value)}
                          placeholder="Client address"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.address || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
