import { Home } from "lucide-react";
import HomeHeroEditor from "../components/HomeHeroEditor";

export default function CmsHomeDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">CMS - Home Page</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Gestiona el contenido de la página principal de la web
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <HomeHeroEditor lang="es" />
      </div>
    </div>
  );
}
