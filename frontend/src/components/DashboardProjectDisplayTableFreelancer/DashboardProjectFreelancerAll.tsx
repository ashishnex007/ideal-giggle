import { columnsAll } from "./columnsAll";
import { DataTable } from "./data-table";
import { Project } from "./data/project";
import { useState } from "react";



interface ProjectDisplayProps {
  data: Project[];
}

export default function DashboardProjectFreelancerAll( { data }:ProjectDisplayProps ) {
  const [loading, setLoading] = useState(false);
  if(!data){
    setLoading(true);
  }
  if (loading) {
    // Render a loading indicator or message
    return <div>Loading...</div>;
  }


  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columnsAll} data={data} />
    </div>
  );
}
