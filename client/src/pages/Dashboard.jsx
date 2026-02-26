import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Main Content - Blank page for customization */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Add your dashboard content here */}
      </main>
    </div>
  );
};

export default Dashboard;
