let hydrateDependency = false;

export const isHydrating = /* @__NO_SIDE_EFFECTS__ */ (): boolean =>
  hydrateDependency;

/**
 * @private
 */
export const hydrating = (): void => {
  hydrateDependency = true;
};
