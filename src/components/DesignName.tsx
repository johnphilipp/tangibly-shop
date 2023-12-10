import React, { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import { useData } from "~/contexts/DataContext";
import { api } from "~/utils/api";

export default function DesignName() {
  const [editDesignName, setEditDesignName] = useState<boolean>(false);
  const { activeDesign, setActiveDesign } = useData();

  const [designName, setDesignName] = useState<string>(
    activeDesign?.name ?? "Untitled-1",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesignName(e.target.value);
  };

  const handleCancel = () => {
    if (!activeDesign) return;
    setDesignName(activeDesign.name);
    setEditDesignName(false);
  };

  const saveName = api.design.setName.useMutation();
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeDesign) return;
    activeDesign.name = designName;
    setActiveDesign(activeDesign);
    setEditDesignName(false);

    console.log("activeDesign", activeDesign);
    void saveName.mutateAsync({
      id: activeDesign.designId,
      name: designName,
    });
  };

  useEffect(() => {
    setDesignName(activeDesign?.name ?? "Untitled-1");
  }, [activeDesign]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-sm items-center space-x-4 pb-2 pt-4"
    >
      Design Name:
      <input
        type="text"
        name="designName"
        id="designName"
        disabled={!editDesignName}
        value={designName}
        onChange={handleChange}
        className="block w-full rounded-md border-gray-200 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 enabled:ml-2 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-100 disabled:text-gray-400 sm:text-sm sm:leading-6"
        placeholder={designName ? designName : "Set a title"}
        required
      />
      {editDesignName ? (
        <>
          <button type="submit" className="rounded bg-blue-500 p-2 text-white">
            Save
          </button>
          <button
            onClick={handleCancel}
            className="rounded bg-gray-600 p-2 text-white"
          >
            Cancel
          </button>
        </>
      ) : (
        <button onClick={() => setEditDesignName(true)}>
          <BiEdit></BiEdit>
        </button>
      )}
    </form>
  );
}
