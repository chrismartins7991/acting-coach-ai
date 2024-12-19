import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import VideoUploader from "./components/VideoUploader";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Video Analysis Demo</h1>
          <VideoUploader />
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
};

export default App;