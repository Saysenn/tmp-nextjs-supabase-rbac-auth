import Nav from "@/components/partials/Nav";
import Header from "@/components/partials/Header";
import Footer from "@/components/partials/Footer";

export default function Home() {
  return (
    <main className="w-full">
      <div>
        <Nav/>
        <Header/>
        <Footer/>
      </div>
    </main>
  );
}
