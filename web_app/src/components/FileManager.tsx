import {
  SyntheticEvent,
  useEffect,
  useState,
  useCallback,
  FormEvent,
} from "react";
import _ from "lodash";
import { PhotoAlbum } from "react-photo-album";
import {
  BarsArrowDownIcon,
  BarsArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  MagnifyingGlassIcon,
  ViewHorizontalIcon,
  ViewGridIcon,
} from "@radix-ui/react-icons";
import { useToggle } from "react-use";
import { useDebounce } from "@uidotdev/usehooks";
import Fuse from "fuse.js";
import { useToast } from "@/components/ui/use-toast";
import { API_ENDPOINT, getMedias } from "@/lib/api";
import { IconButton } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useStore } from "@/lib/states";
import { Filename, SortBy, SortOrder } from "@/lib/types";
import { FolderClosed } from "lucide-react";
import useHotKey from "@/hooks/useHotkey";

interface Photo {
  src: string;
  height: number;
  width: number;
  name: string;
}

// 排序选项常量（暂时未使用）
// const SORT_BY_NAME = "名称";
// const SORT_BY_CREATED_TIME = "创建时间";
// const SORT_BY_MODIFIED_TIME = "修改时间";

const IMAGE_TAB = "image";
const OUTPUT_TAB = "output";
export const MASK_TAB = "mask";

interface Props {
  onPhotoClick(tab: string, filename: string): void;
  photoWidth: number;
}

export default function FileManager(props: Props) {
  const { onPhotoClick, photoWidth } = props;
  const [open, toggleOpen] = useToggle(false);

  const [fileManagerState, updateFileManagerState] = useStore((state) => [
    state.fileManagerState,
    state.updateFileManagerState,
  ]);

  const { toast } = useToast();
  const [scrollTop, setScrollTop] = useState(0);
  const [closeScrollTop, setCloseScrollTop] = useState(0);

  const debouncedSearchText = useDebounce(fileManagerState.searchText, 300);
  const [tab, setTab] = useState(IMAGE_TAB);
  const [filenames, setFilenames] = useState<Filename[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoIndex, setPhotoIndex] = useState(0);

  useHotKey("f", () => {
    toggleOpen();
  });

  useHotKey(
    "left",
    () => {
      let newIndex = photoIndex;
      if (photoIndex > 0) {
        newIndex = photoIndex - 1;
      }
      setPhotoIndex(newIndex);
      onPhotoClick(tab, photos[newIndex].name);
    },
    [photoIndex, photos]
  );

  useHotKey(
    "right",
    () => {
      let newIndex = photoIndex;
      if (photoIndex < photos.length - 1) {
        newIndex = photoIndex + 1;
      }
      setPhotoIndex(newIndex);
      onPhotoClick(tab, photos[newIndex].name);
    },
    [photoIndex, photos]
  );

  useEffect(() => {
    if (!open) {
      setCloseScrollTop(scrollTop);
    }
  }, [open, scrollTop]);

  const onRefChange = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        if (open) {
          setTimeout(() => {
            // TODO: without timeout, scrollTo not work, why?
            node.scrollTo({ top: closeScrollTop, left: 0 });
          }, 100);
        }
      }
    },
    [open, closeScrollTop]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const filenames = await getMedias(tab);
        setFilenames(filenames);
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "出错了！",
          description: e.message ? e.message : e.toString(),
        });
      }
    };
    fetchData();
  }, [tab]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const fetchData = async () => {
      try {
        let filteredFilenames = filenames;
        if (debouncedSearchText) {
          const fuse = new Fuse(filteredFilenames, {
            keys: ["name"],
          });
          const items = fuse.search(debouncedSearchText);
          filteredFilenames = items.map(
            (item) => filteredFilenames[item.refIndex]
          );
        }

        filteredFilenames = _.orderBy(
          filteredFilenames,
          fileManagerState.sortBy,
          fileManagerState.sortOrder
        );

        const newPhotos = filteredFilenames.map((filename: Filename) => {
          const width = photoWidth;
          const height = filename.height * (width / filename.width);
          const src = `${API_ENDPOINT}/media_thumbnail_file?tab=${tab}&filename=${encodeURIComponent(
            filename.name
          )}&width=${Math.ceil(width)}&height=${Math.ceil(height)}`;
          return { src, height, width, name: filename.name };
        });
        setPhotos(newPhotos);
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "出错了！",
          description: e.message ? e.message : e.toString(),
        });
      }
    };
    fetchData();
  }, [filenames, debouncedSearchText, fileManagerState, photoWidth, open]);

  const onScroll = (event: SyntheticEvent) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const onClick = ({ index }: { index: number }) => {
    toggleOpen();
    setPhotoIndex(index);
    onPhotoClick(tab, photos[index].name);
  };

  const renderTitle = () => {
    return (
      <div className="flex items-center gap-2">
        <IconButton tooltip="文件管理器">
          <FolderClosed />
        </IconButton>
        <DialogTitle>文件管理器</DialogTitle>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={toggleOpen}>
      <DialogTrigger asChild>{renderTitle()}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="搜索文件..."
              value={fileManagerState.searchText}
              onChange={(e: FormEvent<HTMLInputElement>) => {
                updateFileManagerState({
                  searchText: e.currentTarget.value,
                });
              }}
            />
            <IconButton tooltip="搜索">
              <MagnifyingGlassIcon />
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value={IMAGE_TAB}>输入</TabsTrigger>
                <TabsTrigger value={OUTPUT_TAB}>输出</TabsTrigger>
                <TabsTrigger value={MASK_TAB}>蒙版</TabsTrigger>
              </TabsList>
            </Tabs>

            <Select
              value={fileManagerState.sortBy}
              onValueChange={(value) => {
                updateFileManagerState({
                  sortBy: value as SortBy,
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SortBy.NAME}>按名称</SelectItem>
                <SelectItem value={SortBy.CTIME}>按创建时间</SelectItem>
                <SelectItem value={SortBy.MTIME}>按修改时间</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={fileManagerState.sortOrder}
              onValueChange={(value) => {
                updateFileManagerState({
                  sortOrder: value as SortOrder,
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={
                    fileManagerState.sortOrder === SortOrder.ASC
                      ? "升序"
                      : "降序"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={SortOrder.ASC}
                  onClick={() => {
                    updateFileManagerState({
                      sortOrder:
                        fileManagerState.sortOrder === SortOrder.ASC
                          ? SortOrder.DESC
                          : SortOrder.ASC,
                    });
                  }}
                >
                  {fileManagerState.sortOrder === SortOrder.ASC ? (
                    <BarsArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <BarsArrowDownIcon className="h-4 w-4" />
                  )}
                </SelectItem>
              </SelectContent>
            </Select>

            <IconButton
              tooltip="切换视图"
              onClick={() => {
                updateFileManagerState({
                  viewMode:
                    fileManagerState.viewMode === "grid" ? "list" : "grid",
                });
              }}
            >
              {fileManagerState.viewMode === "grid" ? (
                <ViewHorizontalIcon className="h-4 w-4" />
              ) : (
                <ViewGridIcon className="h-4 w-4" />
              )}
            </IconButton>
          </div>

          <ScrollArea
            className="h-[400px]"
            onScroll={onScroll}
            ref={onRefChange}
          >
            <PhotoAlbum
              photos={photos}
              onClick={onClick}
              layout={fileManagerState.viewMode === "grid" ? "masonry" : "rows"}
            />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
