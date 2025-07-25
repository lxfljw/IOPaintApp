import { useStore } from "@/lib/states";
import { LabelTitle, RowContainer } from "./LabelTitle";
import { NumberInput } from "../ui/input";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LDMSampler } from "@/lib/types";

const LDMOptions = () => {
  const [settings, updateSettings] = useStore((state) => [
    state.settings,
    state.updateSettings,
  ]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1">
        <LabelTitle
          htmlFor="steps"
          text="步数"
          toolTip="去噪步数。更多的去噪步数通常会导致更高质量的图像，但会降低推理速度。"
        />
        <RowContainer>
          <Slider
            className="w-[180px]"
            defaultValue={[30]}
            min={1}
            max={100}
            step={1}
            value={[Math.floor(settings.ldmSteps)]}
            onValueChange={(vals) => updateSettings({ ldmSteps: vals[0] })}
          />
          <NumberInput
            id="steps"
            className="w-[50px] rounded-full"
            numberValue={settings.ldmSteps}
            allowFloat={false}
            onNumberValueChange={(val) => {
              updateSettings({ ldmSteps: val });
            }}
          />
        </RowContainer>
      </div>
      <RowContainer>
        <LabelTitle text="采样器" />
        <Select
          value={settings.ldmSampler as string}
          onValueChange={(value) => {
            const sampler = value as LDMSampler;
            updateSettings({ ldmSampler: sampler });
          }}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select sampler" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {Object.values(LDMSampler).map((sampler) => (
                <SelectItem key={sampler as string} value={sampler as string}>
                  {sampler as string}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </RowContainer>
    </div>
  );
};

export default LDMOptions;
