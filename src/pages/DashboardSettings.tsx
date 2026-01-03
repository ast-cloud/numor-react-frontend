import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/authStore";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Mail, Pencil, Save, X } from "lucide-react";

const DashboardSettings = () => {
  const user = getCurrentUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    company: user?.company || "",
    email: user?.email || "",
  });

  const handleSave = () => {
    // Update the user in the auth store (in a real app, this would be an API call)
    if (user) {
      user.name = formData.name;
      user.company = formData.company;
      user.email = formData.email;
    }
    setIsEditing(false);
    toast({
      title: "Settings saved",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      company: user?.company || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal and business details</CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
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
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {formData.name || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Company Name
              </Label>
              {isEditing ? (
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {formData.company || "Not set"}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email Address
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted/50 rounded-md">
                  {formData.email || "Not set"}
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
