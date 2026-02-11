export default function TermsPage() {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold text-white mb-8">Conditions d'utilisation</h1>
          
          <div className="prose prose-invert text-slate-300">
            <p>Dernière mise à jour : 11 février 2026</p>
            
            <h2 className="text-2xl font-bold text-white mt-6 mb-2">1. Acceptation des conditions</h2>
            <p>En utilisant Dunkly, vous acceptez d'être lié par ces conditions d'utilisation.</p>
            
            <h2 className="text-2xl font-bold text-white mt-6 mb-2">2. Description du service</h2>
            <p>Dunkly est une plateforme gratuite de gestion de résultats de basket-ball.</p>
            
            <h2 className="text-2xl font-bold text-white mt-6 mb-2">3. Confidentialité</h2>
            <p>Vos données sont traitées avec soin. Nous ne vendons pas vos informations personnelles.</p>
            
            <h2 className="text-2xl font-bold text-white mt-6 mb-2">4. Modification du service</h2>
            <p>Nous nous réservons le droit de modifier ou d'interrompre le service à tout moment.</p>
          </div>
        </div>
      </div>
    );
  }