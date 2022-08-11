import { buildClient } from "@datocms/cma-client";
import { RenderItemFormSidebarPanelCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import { DateTime } from "luxon";

type Props = {
    ctx: RenderItemFormSidebarPanelCtx;
  };

  function buildApiClient(ctx : RenderItemFormSidebarPanelCtx){
    if(typeof ctx.currentUserAccessToken  === 'string') {
     return buildClient({
        apiToken: ctx.currentUserAccessToken,
        environment: ctx.environment
      });
    }
  }

  export function CustomPanel({ ctx }: Props) {

    if (ctx.itemStatus === 'new') {
      return <div>Por favor crear el registro, antes de sincronizar</div>;
    }
      
    return (
      <Canvas ctx={ctx}>
        <Button onClick={(e) => schedule(ctx, e)} fullWidth>
        Guardar y Sincronizar
      </Button>
      </Canvas>
    );
  }
  function schedule( ctx : RenderItemFormSidebarPanelCtx, e: React.MouseEvent){
    if(ctx.item?.id){

      const startDate = ctx.formValues["start_date"];
      const endDate = ctx.formValues["end_date"];

      if(!startDate || !endDate){
        console.warn("The start_date or end_date fields are empty");
        alert("Please enter the start_date or end_date fields");
        return;
      }

      const client = buildApiClient(ctx);

      if(!client){
        console.error("Token is invalid");
        ctx.saveCurrentItem(true);
        return;
      }

      client.items.find(ctx.item?.id ,{})
      .then(  async item => {
          let pubResult = "Publicacion ya habia sido programada";
          let unpubResult = "Despublicacion ya habia sido programada";
          if(!isEquals(startDate, item.meta.publication_scheduled_at)){
            pubResult = await client.scheduledPublication.create(item.id, {
                publication_scheduled_at: startDate
              })
              .then(() => "Publicacion programada")
              .catch(() => "Error programando publicacion");
          } 
          if(!isEquals(endDate,item.meta.unpublishing_scheduled_at)){
            unpubResult = await client.scheduledUnpublishing.create(item.id, {
              unpublishing_scheduled_at: endDate
            })
            .then(() => "Despublicacion programada")
            .catch(() => "Error programando despublicacion");
          } 
          ctx.notice('Schedule sincronizado con éxito');
          console.log(pubResult + " \n" + unpubResult);
        })
      .catch(() => console.error("Error in scheduling"))
      .finally(() => ctx.saveCurrentItem(true));
    }
  }

  function parseDate(date: string | null | unknown){
    if(typeof date === "string")
      return DateTime.fromISO(date);
    return null;
  }

  function isEquals(paramDate1 : string | null | unknown, paramDate2 : string | null | unknown){
    const date1 = parseDate(paramDate1); 
    const date2 = parseDate(paramDate2);
    if(!date1 || !date2)
      return false;
    
    return date1.diff(date2,'seconds' ).seconds === 0 ? true: false;
  }