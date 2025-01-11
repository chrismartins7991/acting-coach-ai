import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' }
];

export const LanguageToggle = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-black/30 hover:bg-white/20 text-white border-white/50 hover:border-white"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="text-white hover:bg-white/10 cursor-pointer"
            onClick={() => console.log(`Switching to ${lang.name}`)}
          >
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};