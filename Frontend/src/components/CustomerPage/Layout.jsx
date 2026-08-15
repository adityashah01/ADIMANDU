import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from './Footer';

export default function Layout() {
    return (
        <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-stone-900">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
