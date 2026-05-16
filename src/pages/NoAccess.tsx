import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { ShieldOff } from "lucide-react";

const NoAccess = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Helmet><title>Numor - No Access</title></Helmet>
    <Card className="p-8 max-w-md text-center space-y-3">
      <ShieldOff className="w-10 h-10 text-muted-foreground mx-auto" />
      <h1 className="text-xl font-semibold">No modules available</h1>
      <p className="text-sm text-muted-foreground">
        Your account doesn't have access to any module yet. Please contact your
        organization owner to grant permissions.
      </p>
    </Card>
  </div>
);

export default NoAccess;
