import { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import { Button, Canvas, Form, TextField } from 'datocms-react-ui';
import { useState } from 'react';

type Props = {
  ctx: RenderConfigScreenCtx;
};

type Parameters = { modelApiKey: string };

export default function ConfigScreen({ ctx }: Props) {
  const parameters = ctx.plugin.attributes.parameters as Parameters;

  const [modelApiKey, setModelApiKey] = useState(parameters.modelApiKey);

  const setting = () => {
    ctx.updatePluginParameters({ modelApiKey: modelApiKey.toLowerCase() });
    ctx.notice('Settings updated successfully!');
  }

  return (
    <Canvas ctx={ctx}>
      <Form>
      <TextField
              id="modelApiKey"
              name="modelApiKey"
              label="Model Api Key" 
              value={modelApiKey || undefined} 
              onChange={ (newValue) => setModelApiKey(newValue.toLowerCase())} />

              <Button buttonType="primary" onClick={setting}  >
                Configurar
              </Button>
          
      </Form>

        
    </Canvas>
  );
}
