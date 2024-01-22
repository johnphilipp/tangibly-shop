import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { activeDesign } from "~/components/shared/utils/data";
import { cartSignal } from "~/components/ShoppingCartSidebar";
import { saveStateSignal, SaveStatus } from "~/components/mug";
import { useSearchParams } from "next/navigation";

export default function DesignName() {
  const [editDesignName, setEditDesignName] = useState<boolean>(false);

  const searchParams = useSearchParams();

  const designId = searchParams.get("designId");

  const [designName, setDesignName] = useState<string>(
    activeDesign.value?.name ?? "Untitled",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesignName(e.target.value);
  };

  const handleCancel = () => {
    if (!activeDesign) return;
    setDesignName(activeDesign.value?.name ?? "Untitled");
    setEditDesignName(false);
  };

  const saveName = api.design.setName.useMutation();
  const handleSubmit = () => {
    if (!activeDesign?.value) return;
    activeDesign.value.name = designName;
    setEditDesignName(false);

    console.log("activeDesign", activeDesign);

    if (!designId) return;
    if (activeDesign.value?.state === "saved") {
      void saveName.mutateAsync({
        id: activeDesign.value.designId,
        name: designName,
      });

      cartSignal.value.map((item) => {
        if (item.design.id === activeDesign.value?.id) {
          item.design.name = designName;
        }
      });
    }
  };

  useEffect(() => {
    if (activeDesign.value?.name === designName) return;
    setDesignName(activeDesign.value?.name ?? "Untitled");
  }, [activeDesign.value]);

  return (
    <input
      type="text"
      name="designName"
      id="designName"
      value={designName}
      onChange={handleChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur(); // This will remove focus from the input field
        }
        if (e.key === "Escape") {
          handleCancel(); // This will remove focus from the input field and revert the value
          e.currentTarget.blur();
        }
      }}
      onClick={(e) => {
        e.currentTarget.select();
        setEditDesignName(true);
      }}
      onBlur={() => {
        handleSubmit();
      }}
      className="mt-5 block w-full border border-gray-200 text-lg text-black placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 "
      placeholder={designName ? designName : "Set a title"}
      required
    />
  );
}
