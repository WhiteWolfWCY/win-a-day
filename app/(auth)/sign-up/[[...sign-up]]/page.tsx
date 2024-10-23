import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex w-full h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="w-96 h-96 rounded-full bg-primary animate-pulse absolute top-20 left-10 hidden md:block"></div>
        <div className="w-80 h-80 rounded-full bg-primary animate-pulse absolute bottom-20 right-20 hidden md:block"></div>
      </div>
        <SignUp />
    </div>
  );
}
