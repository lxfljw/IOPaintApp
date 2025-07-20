import { FormEvent, useRef } from "react";
import { useStore } from "@/lib/states";
import { Switch } from "../ui/switch";
import { NumberInput } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { ExtenderDirection, PowerPaintTask } from "@/lib/types";
import { Separator } from "../ui/separator";
import { Button, ImageUploadButton } from "../ui/button";
import { Slider } from "../ui/slider";
import { useImage } from "@/hooks/useImage";
import {
  ANYTEXT,
  INSTRUCT_PIX2PIX,
  PAINT_BY_EXAMPLE,
  POWERPAINT,
} from "@/lib/const";
import { RowContainer, LabelTitle } from "./LabelTitle";
import { Upload } from "lucide-react";
import { useClickAway } from "react-use";

const ExtenderButton = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => {
  const [showExtender] = useStore((state) => [state.settings.showExtender]);
  return (
    <Button
      variant="outline"
      className="p-1 h-8"
      disabled={!showExtender}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">{text}</div>
    </Button>
  );
};

const DiffusionOptions = () => {
  const [
    samplers,
    settings,
    paintByExampleFile,
    isProcessing,
    updateSettings,
    runInpainting,
    updateAppState,
    updateExtenderByBuiltIn,
    updateExtenderDirection,
    adjustMask,
    clearMask,
    updateEnablePowerPaintV2,
    updateEnableBrushNet,
    updateEnableControlnet,
    updateLCMLora,
  ] = useStore((state) => [
    state.serverConfig.samplers,
    state.settings,
    state.paintByExampleFile,
    state.getIsProcessing(),
    state.updateSettings,
    state.runInpainting,
    state.updateAppState,
    state.updateExtenderByBuiltIn,
    state.updateExtenderDirection,
    state.adjustMask,
    state.clearMask,
    state.updateEnablePowerPaintV2,
    state.updateEnableBrushNet,
    state.updateEnableControlnet,
    state.updateLCMLora,
  ]);
  const [exampleImage, isExampleImageLoaded] = useImage(paintByExampleFile);
  const negativePromptRef = useRef(null);
  useClickAway<MouseEvent>(negativePromptRef, () => {
    if (negativePromptRef?.current) {
      const input = negativePromptRef.current as HTMLInputElement;
      input.blur();
    }
  });

  const onKeyUp = (e: React.KeyboardEvent) => {
    // negativePrompt 回车触发 inpainting
    if (e.key === "Enter" && e.ctrlKey && settings.prompt.length !== 0) {
      runInpainting();
    }
  };

  const renderCropper = () => {
    return (
      <RowContainer>
        <LabelTitle
          text="裁剪器"
          toolTip="在图像的一部分上进行修复，提高推理速度并减少内存使用。"
        />
        <Switch
          id="cropper"
          checked={settings.showCropper}
          onCheckedChange={(value) => {
            updateSettings({ showCropper: value });
            if (value) {
              updateSettings({ showExtender: false });
            }
          }}
        />
      </RowContainer>
    );
  };

  const renderBrushNetSetting = () => {
    if (!settings.model.support_brushnet) {
      return null;
    }

    let toolTip =
      "BrushNet是一个即插即用的图像修复模型，适用于任何SD1.5基础模型。";

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <RowContainer>
            <LabelTitle
              text="BrushNet"
              url="https://github.com/TencentARC/BrushNet"
              toolTip={toolTip}
            />
            <Switch
              id="brushnet"
              checked={settings.enableBrushNet}
              onCheckedChange={(value) => {
                updateEnableBrushNet(value);
              }}
            />
          </RowContainer>
          <RowContainer>
            <Slider
              defaultValue={[100]}
              className="w-[180px]"
              min={1}
              max={100}
              step={1}
              disabled={!settings.enableBrushNet}
              value={[Math.floor(settings.brushnetConditioningScale * 100)]}
              onValueChange={(vals) =>
                updateSettings({ brushnetConditioningScale: vals[0] / 100 })
              }
            />
            <NumberInput
              id="brushnet-weight"
              className="w-[50px] rounded-full"
              numberValue={settings.brushnetConditioningScale}
              allowFloat
              onNumberValueChange={(val) => {
                updateSettings({ brushnetConditioningScale: val });
              }}
            />
          </RowContainer>

          <RowContainer>
            <Select
              defaultValue={settings.brushnetMethod}
              value={settings.brushnetMethod}
              onValueChange={(value) => {
                updateSettings({ brushnetMethod: value });
              }}
              disabled={!settings.enableBrushNet}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select brushnet model" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  {Object.values(settings.model.brushnets).map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.split("/")[1]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </RowContainer>
        </div>
        <Separator />
      </div>
    );
  };

  const renderConterNetSetting = () => {
    if (!settings.model.support_controlnet) {
      return null;
    }

    let toolTip = "使用额外的条件图像来控制图像生成的方式";

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <RowContainer>
            <LabelTitle
              text="ControlNet"
              url="https://huggingface.co/docs/diffusers/main/en/using-diffusers/inpaint#controlnet"
              toolTip={toolTip}
            />
            <Switch
              id="controlnet"
              checked={settings.enableControlnet}
              onCheckedChange={(value) => {
                updateEnableControlnet(value);
              }}
            />
          </RowContainer>

          <div className="flex flex-col gap-1">
            <RowContainer>
              <Slider
                className="w-[180px]"
                defaultValue={[100]}
                min={1}
                max={100}
                step={1}
                disabled={!settings.enableControlnet}
                value={[Math.floor(settings.controlnetConditioningScale * 100)]}
                onValueChange={(vals) =>
                  updateSettings({ controlnetConditioningScale: vals[0] / 100 })
                }
              />
              <NumberInput
                id="controlnet-weight"
                className="w-[50px] rounded-full"
                disabled={!settings.enableControlnet}
                numberValue={settings.controlnetConditioningScale}
                allowFloat
                onNumberValueChange={(val) => {
                  updateSettings({ controlnetConditioningScale: val });
                }}
              />
            </RowContainer>
          </div>

          <RowContainer>
            <Select
              defaultValue={settings.controlnetMethod}
              value={settings.controlnetMethod}
              onValueChange={(value) => {
                updateSettings({ controlnetMethod: value });
              }}
              disabled={!settings.enableControlnet}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select control method" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  {Object.values(settings.model.controlnets).map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.split("/")[1]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </RowContainer>
        </div>
        <Separator />
      </div>
    );
  };

  const renderLCMLora = () => {
    if (!settings.model.support_lcm_lora) {
      return null;
    }

    let toolTip =
      "启用高质量图像生成，通常只需2-8步。建议通过将guidance_scale设置为0来禁用它。您也可以尝试1.0到2.0之间的值。启用LCM Lora时，将自动使用LCMSampler。";

    return (
      <>
        <RowContainer>
          <LabelTitle
            text="LCM LoRA"
            url="https://huggingface.co/docs/diffusers/main/en/using-diffusers/inference_with_lcm_lora"
            toolTip={toolTip}
          />
          <Switch
            id="lcm-lora"
            checked={settings.enableLCMLora}
            onCheckedChange={(value) => {
              updateLCMLora(value);
            }}
          />
        </RowContainer>
        <Separator />
      </>
    );
  };

  const renderNegativePrompt = () => {
    if (!settings.model.need_prompt) {
      return null;
    }

    return (
      <div className="flex flex-col gap-4">
        <LabelTitle
          text="负面提示词"
          url="https://huggingface.co/docs/diffusers/main/en/using-diffusers/inpaint#negative-prompt"
          toolTip="负面提示词引导模型避免在图像中生成某些内容"
        />
        <div className="pl-2 pr-4">
          <Textarea
            ref={negativePromptRef}
            rows={4}
            onKeyUp={onKeyUp}
            className="max-h-[8rem] overflow-y-auto mb-2"
            placeholder=""
            id="negative-prompt"
            value={settings.negativePrompt}
            onInput={(evt: FormEvent<HTMLTextAreaElement>) => {
              evt.preventDefault();
              evt.stopPropagation();
              const target = evt.target as HTMLTextAreaElement;
              updateSettings({ negativePrompt: target.value });
            }}
          />
        </div>
      </div>
    );
  };

  const renderPaintByExample = () => {
    if (settings.model.name !== PAINT_BY_EXAMPLE) {
      return null;
    }

    return (
      <div>
        <RowContainer>
          <LabelTitle text="示例图片" toolTip="用于指导图像生成的示例图片。" />
          <ImageUploadButton
            tooltip="上传示例图片"
            onFileUpload={(file) => {
              updateAppState({ paintByExampleFile: file });
            }}
          >
            <Upload />
          </ImageUploadButton>
        </RowContainer>
        {isExampleImageLoaded ? (
          <div className="flex justify-center items-center">
            <img
              src={exampleImage.src}
              alt="example"
              className="max-w-[200px] max-h-[200px] m-3"
            />
          </div>
        ) : (
          <></>
        )}
        <Button
          variant="default"
          className="w-full"
          disabled={isProcessing || !isExampleImageLoaded}
          onClick={() => {
            runInpainting();
          }}
        >
          Paint
        </Button>
      </div>
    );
  };

  const renderP2PImageGuidanceScale = () => {
    if (settings.model.name !== INSTRUCT_PIX2PIX) {
      return null;
    }
    return (
      <div className="flex flex-col gap-1">
        <LabelTitle
          text="图像引导比例"
          toolTip="推动生成的图像朝向初始图像。更高的图像引导比例鼓励生成的图像与源图像紧密相关，通常以降低图像质量为代价。"
          url="https://huggingface.co/docs/diffusers/main/en/api/pipelines/pix2pix"
        />
        <RowContainer>
          <Slider
            className="w-[180px]"
            defaultValue={[150]}
            min={100}
            max={1000}
            step={1}
            value={[Math.floor(settings.p2pImageGuidanceScale * 100)]}
            onValueChange={(vals) =>
              updateSettings({ p2pImageGuidanceScale: vals[0] / 100 })
            }
          />
          <NumberInput
            id="image-guidance-scale"
            className="w-[50px] rounded-full"
            numberValue={settings.p2pImageGuidanceScale}
            allowFloat
            onNumberValueChange={(val) => {
              updateSettings({ p2pImageGuidanceScale: val });
            }}
          />
        </RowContainer>
      </div>
    );
  };

  const renderStrength = () => {
    if (!settings.model.support_strength) {
      return null;
    }

    let toolTip =
      "强度是添加到基础图像的噪声量的度量，它影响输出与基础图像的相似程度。更高的值意味着更多的噪声和与基础图像更大的差异";
    // if (disable) {
    //   toolTip = "BrushNet is enabled, Strength is disabled."
    // }

    return (
      <RowContainer>
        <LabelTitle
          text="强度"
          url="https://huggingface.co/docs/diffusers/main/en/using-diffusers/inpaint#strength"
          toolTip={toolTip}
          // disabled={disable}
        />
        <div className="flex gap-4">
          <Slider
            className="w-[120px]"
            defaultValue={[100]}
            min={10}
            max={100}
            step={1}
            value={[Math.floor(settings.sdStrength * 100)]}
            onValueChange={(vals) =>
              updateSettings({ sdStrength: vals[0] / 100 })
            }
            // disabled={disable}
          />
          <NumberInput
            id="strength"
            className="w-[50px] rounded-full"
            numberValue={settings.sdStrength}
            allowFloat
            onNumberValueChange={(val) => {
              updateSettings({ sdStrength: val });
            }}
            // disabled={disable}
          />
        </div>
      </RowContainer>
    );
  };

  const renderExtender = () => {
    if (!settings.model.support_outpainting) {
      return null;
    }
    return (
      <>
        <div className="flex flex-col gap-2">
          <RowContainer>
            <LabelTitle
              text="扩展器"
              toolTip="在图像上执行外绘以扩展其内容。"
            />
            <Switch
              id="extender"
              checked={settings.showExtender}
              onCheckedChange={(value) => {
                updateSettings({ showExtender: value });
                if (value) {
                  updateSettings({ showCropper: false });
                }
              }}
            />
          </RowContainer>

          <RowContainer>
            <Select
              defaultValue={settings.extenderDirection}
              value={settings.extenderDirection}
              onValueChange={(value) => {
                updateExtenderDirection(value as ExtenderDirection);
              }}
            >
              <SelectTrigger
                className="w-[65px] h-7"
                disabled={!settings.showExtender}
              >
                <SelectValue placeholder="Select axis" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  {Object.values(ExtenderDirection).map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex gap-1 justify-center mt-0">
              <ExtenderButton
                text="1.25x"
                onClick={() =>
                  updateExtenderByBuiltIn(settings.extenderDirection, 1.25)
                }
              />
              <ExtenderButton
                text="1.5x"
                onClick={() =>
                  updateExtenderByBuiltIn(settings.extenderDirection, 1.5)
                }
              />
              <ExtenderButton
                text="1.75x"
                onClick={() =>
                  updateExtenderByBuiltIn(settings.extenderDirection, 1.75)
                }
              />
              <ExtenderButton
                text="2.0x"
                onClick={() =>
                  updateExtenderByBuiltIn(settings.extenderDirection, 2.0)
                }
              />
            </div>
          </RowContainer>
        </div>
        <Separator />
      </>
    );
  };

  const renderPowerPaintTaskType = () => {
    return (
      <RowContainer>
        <LabelTitle
          text="任务"
          toolTip="PowerPaint任务。使用扩展器时，将自动使用图像外绘任务。对于对象移除和图像外绘，建议将guidance_scale设置为10或更高。"
        />
        <Select
          defaultValue={settings.powerpaintTask}
          value={settings.powerpaintTask}
          onValueChange={(value: PowerPaintTask) => {
            updateSettings({ powerpaintTask: value });
          }}
          disabled={settings.showExtender}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select task" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {[
                PowerPaintTask.text_guided,
                PowerPaintTask.object_remove,
                PowerPaintTask.context_aware,
                PowerPaintTask.shape_guided,
              ].map((task) => (
                <SelectItem key={task} value={task}>
                  {task}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </RowContainer>
    );
  };

  const renderPowerPaintV1 = () => {
    if (settings.model.name !== POWERPAINT) {
      return null;
    }
    return (
      <>
        {renderPowerPaintTaskType()}
        <Separator />
      </>
    );
  };

  const renderPowerPaintV2 = () => {
    if (settings.model.support_powerpaint_v2 === false) {
      return null;
    }

    return (
      <>
        <RowContainer>
          <LabelTitle
            text="PowerPaint V2"
            toolTip="PowerPaint是一个即插即用的图像修复模型，适用于任何SD1.5基础模型。"
          />
          <Switch
            id="powerpaint-v2"
            checked={settings.enablePowerPaintV2}
            onCheckedChange={(value) => {
              updateEnablePowerPaintV2(value);
            }}
          />
        </RowContainer>
        {renderPowerPaintTaskType()}
        <Separator />
      </>
    );
  };

  const renderSteps = () => {
    return (
      <RowContainer>
        <LabelTitle
          htmlFor="steps"
          text="步数"
          toolTip="去噪步数。更多的去噪步数通常会导致更高质量的图像，但会降低推理速度。"
        />

        <div className="flex gap-4">
          <Slider
            className="w-[120px]"
            defaultValue={[30]}
            min={1}
            max={100}
            step={1}
            value={[Math.floor(settings.sdSteps)]}
            onValueChange={(vals) => updateSettings({ sdSteps: vals[0] })}
          />
          <NumberInput
            id="steps"
            className="w-[50px] rounded-full"
            numberValue={settings.sdSteps}
            allowFloat={false}
            onNumberValueChange={(val) => {
              updateSettings({ sdSteps: val });
            }}
          />
        </div>
      </RowContainer>
    );
  };

  const renderGuidanceScale = () => {
    return (
      <RowContainer>
        <LabelTitle
          text="引导比例"
          url="https://huggingface.co/docs/diffusers/main/en/using-diffusers/inpaint#guidance-scale"
          toolTip="引导比例影响文本提示词和生成图像的匹配程度。更高的值意味着提示词和生成的图像紧密匹配，因此输出是对提示词的更严格解释"
        />
        <div className="flex gap-4">
          <Slider
            className="w-[120px]"
            defaultValue={[750]}
            min={0}
            max={1500}
            step={1}
            value={[Math.floor(settings.sdGuidanceScale * 100)]}
            onValueChange={(vals) =>
              updateSettings({ sdGuidanceScale: vals[0] / 100 })
            }
          />
          <NumberInput
            id="guid"
            className="w-[50px] rounded-full"
            numberValue={settings.sdGuidanceScale}
            allowFloat
            onNumberValueChange={(val) => {
              updateSettings({ sdGuidanceScale: val });
            }}
          />
        </div>
      </RowContainer>
    );
  };

  const renderSampler = () => {
    if (settings.model.name === ANYTEXT) {
      return null;
    }

    return (
      <RowContainer>
        <LabelTitle text="采样器" />
        <Select
          defaultValue={settings.sdSampler}
          value={settings.sdSampler}
          onValueChange={(value) => {
            updateSettings({ sdSampler: value });
          }}
        >
          <SelectTrigger className="w-[175px] text-xs">
            <SelectValue placeholder="Select sampler" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectGroup>
              {samplers.map((sampler) => (
                <SelectItem key={sampler} value={sampler} className="text-xs">
                  {sampler}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </RowContainer>
    );
  };

  const renderSeed = () => {
    return (
      <RowContainer>
        {/* 每次会从服务器返回更新该值 */}
        <LabelTitle
          text="种子"
          toolTip="使用相同的参数和固定的种子可以生成相同的结果图像。"
        />
        {/* <Pin /> */}
        <div className="flex gap-2 justify-center items-center">
          <Switch
            id="seed"
            checked={settings.seedFixed}
            onCheckedChange={(value) => {
              updateSettings({ seedFixed: value });
            }}
          />
          <NumberInput
            id="seed"
            className="w-[110px]"
            disabled={!settings.seedFixed}
            numberValue={settings.seed}
            allowFloat={false}
            onNumberValueChange={(val) => {
              updateSettings({ seed: val });
            }}
          />
        </div>
      </RowContainer>
    );
  };

  const renderMaskBlur = () => {
    return (
      <>
        <RowContainer>
          <LabelTitle
            text="蒙版模糊"
            toolTip="处理前对蒙版进行模糊的程度，以像素为单位。使生成的修复边界看起来更自然。"
          />
          <div className="flex gap-4">
            <Slider
              className="w-[120px]"
              defaultValue={[settings.sdMaskBlur]}
              min={0}
              max={96}
              step={1}
              value={[Math.floor(settings.sdMaskBlur)]}
              onValueChange={(vals) => updateSettings({ sdMaskBlur: vals[0] })}
            />
            <NumberInput
              id="mask-blur"
              className="w-[50px] rounded-full"
              numberValue={settings.sdMaskBlur}
              allowFloat={false}
              onNumberValueChange={(value) => {
                updateSettings({ sdMaskBlur: value });
              }}
            />
          </div>
        </RowContainer>
        <Separator />
      </>
    );
  };

  const renderMatchHistograms = () => {
    return (
      <>
        <RowContainer>
          <LabelTitle
            text="匹配直方图"
            toolTip="将修复结果的直方图与源图像的直方图匹配"
            url="https://github.com/Sanster/lama-cleaner/pull/143#issuecomment-1325859307"
          />
          <Switch
            id="match-histograms"
            checked={settings.sdMatchHistograms}
            onCheckedChange={(value) => {
              updateSettings({ sdMatchHistograms: value });
            }}
          />
        </RowContainer>
        <Separator />
      </>
    );
  };

  const renderMaskAdjuster = () => {
    return (
      <>
        <div className="flex flex-col gap-2">
          <RowContainer>
            <LabelTitle
              htmlFor="adjustMaskKernelSize"
              text="蒙版操作"
              toolTip="扩展或收缩蒙版。使用滑块调整膨胀或腐蚀的核大小。"
            />
            <div className="flex gap-4">
              <Slider
                className="w-[120px]"
                defaultValue={[12]}
                min={1}
                max={100}
                step={1}
                value={[Math.floor(settings.adjustMaskKernelSize)]}
                onValueChange={(vals) =>
                  updateSettings({ adjustMaskKernelSize: vals[0] })
                }
              />
              <NumberInput
                id="adjustMaskKernelSize"
                className="w-[50px] rounded-full"
                numberValue={settings.adjustMaskKernelSize}
                allowFloat={false}
                onNumberValueChange={(val) => {
                  updateSettings({ adjustMaskKernelSize: val });
                }}
              />
            </div>
          </RowContainer>

          <RowContainer>
            <Button
              variant="outline"
              className="p-1 h-8"
              onClick={() => adjustMask("expand")}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-1 select-none">
                {/* <Plus size={16} /> */}
                Expand
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-1 h-8"
              onClick={() => adjustMask("shrink")}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-1 select-none">
                {/* <Minus size={16} /> */}
                Shrink
              </div>
            </Button>

            <Button
              variant="outline"
              className="p-1 h-8"
              onClick={() => adjustMask("reverse")}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-1 select-none">Reverse</div>
            </Button>

            <Button
              variant="outline"
              className="p-1 h-8 justify-self-end"
              onClick={clearMask}
              disabled={isProcessing}
            >
              <div className="flex items-center gap-1 select-none">Clear</div>
            </Button>
          </RowContainer>
        </div>
        <Separator />
      </>
    );
  };

  return (
    <div className="flex flex-col gap-[14px] mt-4">
      {renderCropper()}
      {renderExtender()}
      {renderMaskBlur()}
      {renderMaskAdjuster()}
      {renderMatchHistograms()}
      {renderPowerPaintV1()}
      {renderSteps()}
      {renderGuidanceScale()}
      {renderP2PImageGuidanceScale()}
      {renderStrength()}
      {renderSampler()}
      {renderSeed()}
      {renderNegativePrompt()}
      <Separator />
      {renderBrushNetSetting()}
      {renderPowerPaintV2()}
      {renderConterNetSetting()}
      {renderLCMLora()}
      {renderPaintByExample()}
    </div>
  );
};

export default DiffusionOptions;
