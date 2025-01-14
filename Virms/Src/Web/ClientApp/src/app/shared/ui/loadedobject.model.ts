// Copyright (c) 2021 Stefan Grimm. All rights reserved.
// Licensed under the GPL. See LICENSE file in the project root for full license information.
//

import { Observable } from 'rxjs';
import * as THREE from 'three';
import { Group, Material, Object3D, Quaternion, Vector3 } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export interface LoadableObject {

  origin: Vector3
  normal: Vector3
  position: Vector3
  material: Material

  object: Object3D

  load(url: string): Observable<Object3D>
  loadInvisible(url: string): Observable<Object3D>

  setLng(lng: number)
  translate(value: Vector3)
  setRtn(rtn: number)

  rotate(rtn: number, axis: Vector3)

  setVisible(show: boolean)

  setMaterial(mat: Material)
}

export class LoadedObject implements LoadableObject {

  private readonly worldsNormal: Vector3 = new THREE.Vector3(0, 0, 1);

  origin: Vector3
  normal: Vector3
  position: Vector3
  center: Vector3
  material: Material

  object: Object3D
  private objectAsGroup: Group

  static tryAdd(target: LoadableObject): Observable<Object3D> {
    return new Observable<Object3D>(subscriber => {
      if (target != null && target.object != null) {
        console.debug(LoadedObject.name, "tryAdd", "add already loaded")
        subscriber.next(target.object)
      }
      else {
        subscriber.error()
      }
    })
  }

  load(url: string): Observable<Object3D> {
    return this._load(url, true)
  }

  loadInvisible(url: string): Observable<Object3D> {
    return this._load(url, false)
  }

  private _load(url: string, show: boolean): Observable<Object3D> {
    return new Observable<Object3D>(subscriber => {
      const loader = new OBJLoader()
      console.info(LoadedObject.name, "load", url)
      loader.load(url,
        group => {
          group.traverse(child => {
            if (child instanceof THREE.Mesh) {
              child.material = this.material
            }
          })

          this.object = group
          this.object.visible = show
          this.objectAsGroup = group

          const q = new Quaternion()
          q.setFromUnitVectors(this.normal, this.worldsNormal)
          this.object.setRotationFromQuaternion(q)

          this.object.translateX(this.origin.x)
          this.object.translateY(this.origin.y)
          this.object.translateZ(this.origin.z)

          this.object.position.x = this.position.x
          this.object.position.y = this.position.y
          this.object.position.z = this.position.z

          subscriber.next(this.object)
        },
        () => { },
        error => {
          console.error(LoadedObject.name, error)
          subscriber.error()
        })
    })
  }

  setLng(lng: number) {
    this.object.position.z = this.position.z + lng
  }

  translate(value: Vector3) {
    this.object.position.y = this.position.y + value.y
  }

  setRtn(rtn: number) {
    this.rotate(rtn, this.normal)
  }

  rotate(rtn: number, axis: Vector3) {
    this.object.translateX(-this.origin.x)
    this.object.translateY(-this.origin.y)
    this.object.translateZ(-this.origin.z)

    const q = new Quaternion()
    q.setFromUnitVectors(this.normal, this.worldsNormal)

    const qRtn = new Quaternion();
    qRtn.setFromAxisAngle(axis, rtn);
    q.multiply(qRtn)
    this.object.setRotationFromQuaternion(q)

    this.object.translateX(this.origin.x)
    this.object.translateY(this.origin.y)
    this.object.translateZ(this.origin.z)
  }

  setVisible(show: boolean) {
    if (this.object) {
      this.object.visible = show
    }
  }

  setMaterial(mat: Material) {
    if (this.objectAsGroup) {
      this.objectAsGroup.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = mat
        }
      })
    }
  }
}

export class NotLoadedObject implements LoadableObject {

  origin: Vector3
  normal: Vector3
  position: Vector3
  center: Vector3
  material: Material

  object: Object3D = new Object3D

  load(url: string): Observable<Object3D> {
    return new Observable<Object3D>(subscriber => {
      subscriber.error()
    })
  }
  loadInvisible(url: string): Observable<Object3D> {
    return new Observable<Object3D>(subscriber => {
      subscriber.error()
    })
  }

  setLng(lng: number) {
  }

  translate(value: Vector3) {
  }

  setRtn(rtn: number) {
  }

  rotate(rtn: number, axis: Vector3) {
   
  }

  setVisible(show: boolean) {
  }

  setMaterial(mat: Material) {
  }
}
