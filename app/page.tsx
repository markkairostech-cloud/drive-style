export default function Home() {
  return (
    <main style={{
      background:"#0b0f17",
      color:"white",
      minHeight:"100vh",
      padding:"40px",
      fontFamily:"Arial"
    }}>
      
      <h1 style={{fontSize:"42px", marginBottom:"10px"}}>
        Drive Style
      </h1>

      <h2 style={{color:"#9fb3ff", marginTop:"0"}}>
        Confidence in Every Car Choice
      </h2>

      <p style={{maxWidth:"600px", lineHeight:"1.6", color:"#b9c2d6"}}>
        A premium vehicle concierge advisory service helping you choose the right car for your lifestyle, budget and real-world South African driving needs.
      </p>

      <div style={{marginTop:"30px"}}>
        <button style={{
          background:"#9fb3ff",
          color:"#000",
          border:"none",
          padding:"12px 20px",
          borderRadius:"8px",
          fontWeight:"bold",
          marginRight:"10px"
        }}>
          Start Quick Match
        </button>

        <button style={{
          background:"transparent",
          color:"white",
          border:"1px solid #9fb3ff",
          padding:"12px 20px",
          borderRadius:"8px"
        }}>
          Book Consultation
        </button>
      </div>

    </main>
  );
}